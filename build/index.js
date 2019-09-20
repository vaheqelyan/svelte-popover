(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Popover = factory());
}(this, function () { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    /* src\Overlay.svelte generated by Svelte v3.12.1 */

    function add_css() {
    	var style = element("style");
    	style.id = 'svelte-v17cfx-style';
    	style.textContent = ".overlay.svelte-v17cfx{position:fixed;width:100%;height:100%;top:0;left:0;cursor:pointer}";
    	append(document.head, style);
    }

    function create_fragment(ctx) {
    	var div, dispose;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "id", "overlay");
    			attr(div, "class", "overlay svelte-v17cfx");
    			set_style(div, "z-index", ctx.zIndex);
    			set_style(div, "background-color", ctx.overlayColor);

    			dispose = [
    				listen(div, "mouseenter", ctx.onMouseEnter),
    				listen(div, "click", ctx.onClick),
    				listen(div, "touchend", ctx.onTouchEnd)
    			];
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p(changed, ctx) {
    			if (changed.zIndex) {
    				set_style(div, "z-index", ctx.zIndex);
    			}

    			if (changed.overlayColor) {
    				set_style(div, "background-color", ctx.overlayColor);
    			}
    		},

    		i: noop,
    		o: noop,

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { zIndex, action, overlayColor = 'rgba(0,0,0,0.5)' } = $$props;

      const dispatch = createEventDispatcher();

      const eventClick = () => {
        dispatch('setOpen', {});
      };

      const onClick = action === 'click' ? eventClick : null;
      const onTouchEnd = action === 'click' ? eventClick : null;

      const onMouseEnter = action === 'hover' ? eventClick : null;

    	$$self.$set = $$props => {
    		if ('zIndex' in $$props) $$invalidate('zIndex', zIndex = $$props.zIndex);
    		if ('action' in $$props) $$invalidate('action', action = $$props.action);
    		if ('overlayColor' in $$props) $$invalidate('overlayColor', overlayColor = $$props.overlayColor);
    	};

    	return {
    		zIndex,
    		action,
    		overlayColor,
    		onClick,
    		onTouchEnd,
    		onMouseEnter
    	};
    }

    class Overlay extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-v17cfx-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, ["zIndex", "action", "overlayColor"]);
    	}
    }

    /* src\Content.svelte generated by Svelte v3.12.1 */

    function add_css$1() {
    	var style = element("style");
    	style.id = 'svelte-1kx3zk8-style';
    	style.textContent = ".content.svelte-1kx3zk8{display:inline-block;position:absolute}";
    	append(document.head, style);
    }

    // (10:2) {#if arrow}
    function create_if_block(ctx) {
    	var div, t, div_style_value;

    	return {
    		c() {
    			div = element("div");
    			t = text("◥");
    			attr(div, "style", div_style_value = "position: absolute; color: " + ctx.arrowColor + "; " + ctx.arrowStyle);
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    			ctx.div_binding(div);
    		},

    		p(changed, ctx) {
    			if ((changed.arrowColor || changed.arrowStyle) && div_style_value !== (div_style_value = "position: absolute; color: " + ctx.arrowColor + "; " + ctx.arrowStyle)) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.div_binding(null);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div, t0, div_style_value, t1, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var if_block = (ctx.arrow) && create_if_block(ctx);

    	var overlay = new Overlay({
    		props: { zIndex: ctx.zIndex, action: ctx.action }
    	});
    	overlay.$on("setOpen", ctx.setOpen);

    	return {
    		c() {
    			div = element("div");

    			if (default_slot) default_slot.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			overlay.$$.fragment.c();

    			attr(div, "class", "content svelte-1kx3zk8");
    			attr(div, "style", div_style_value = "z-index: " + (ctx.zIndex + 10) + "; " + ctx.positionStyle);
    		},

    		l(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append(div, t0);
    			if (if_block) if_block.m(div, null);
    			ctx.div_binding_1(div);
    			insert(target, t1, anchor);
    			mount_component(overlay, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (ctx.arrow) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || changed.zIndex || changed.positionStyle) && div_style_value !== (div_style_value = "z-index: " + (ctx.zIndex + 10) + "; " + ctx.positionStyle)) {
    				attr(div, "style", div_style_value);
    			}

    			var overlay_changes = {};
    			if (changed.zIndex) overlay_changes.zIndex = ctx.zIndex;
    			if (changed.action) overlay_changes.action = ctx.action;
    			overlay.$set(overlay_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			transition_in(overlay.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(default_slot, local);
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			ctx.div_binding_1(null);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(overlay, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { arrowColor, open, targetRef, zIndex, arrow, placement, action } = $$props;

      let contentRef;
      let arrowRef;
      let positionStyle = ``;
      let arrowStyle = ``;

      const dispatch = createEventDispatcher();

      const setOpen = () => {
        dispatch('setOpen', {});
      };

      const calculate = () => {
        const targetBound = targetRef.getBoundingClientRect();
        const contentBound = contentRef.getBoundingClientRect();

        const atTop = targetBound.y - contentBound.height;
        const atRight = window.innerWidth - (targetBound.right + contentBound.width);
        const atLeft = targetBound.x - contentBound.width;

        const atBottom = window.innerHeight - (targetBound.bottom + contentBound.height);

        let arrowBound = { width: 0, height: 0 },
          arrowClientH = 0;
        if (arrow) {
          arrowBound = arrowRef.getBoundingClientRect();
          arrowClientH = arrowRef.clientHeight;
        }

        const pos = [
          {
            at: 'top-start',
            check1: atTop,
            check2: window.innerWidth - (targetBound.left + contentBound.width),
            check3: 0,
            style: `top:${-(contentBound.height + arrowClientH / 2)}px;left:0px;`,
            arrow: `transform: rotate(135deg);bottom:${-Math.ceil(arrowClientH / 2)}px;left:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
          },
          {
            at: 'top-center',
            check1: atTop,
            check2: contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2,
            check3: window.innerWidth - (contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2 + contentBound.width),
            style: `top:${-(contentBound.height + arrowClientH / 2)}px;left:${-(contentBound.width / 2) + targetBound.width / 2}px`,
            arrow: `transform:rotate(135deg);bottom:${-Math.ceil(arrowClientH / 2)}px;left:${contentBound.width / 2 - arrowBound.width / 2}px`,
          },
          {
            at: 'top-end',
            check1: atTop,
            check2: targetBound.right - contentBound.width,
            check3: 0,
            style: `top:${-(contentBound.height + arrowBound.height / 2)}px;left:${-(contentBound.width - targetBound.width)}px`,
            arrow: `transform: rotate(135deg);bottom:${-arrowBound.height / 2}px;right:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
          },
          {
            at: 'left-start',
            check1: atLeft,
            check2: window.innerHeight - (targetBound.top + contentBound.height),
            check3: 0,
            style: `left: ${-(contentBound.width + arrowBound.width / 2)}px`,
            arrow: `transform: rotate(45deg);top:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px;left:${contentBound.width - arrowBound.width / 2}px`,
          },
          {
            at: 'left-center',
            check1: atLeft,
            check2: contentBound.y - (contentBound.height / 2 + targetBound.height / 2),
            check3: window.innerHeight - (contentBound.y - (contentBound.height / 2 + targetBound.height / 2) + contentBound.height),
            style: `left:${-(contentBound.width + arrowBound.width / 2)}px;top:${-(contentBound.height / 2 - targetBound.height / 2)}px`,
            arrow: `transform:rotate(45deg);left:${contentBound.width - arrowBound.width / 2}px;top:${contentBound.height / 2 - arrowClientH / 2}px`,
          },
          {
            at: 'left-end',
            check1: atLeft,
            check2: targetBound.bottom - contentBound.height,
            check3: 0,
            style: `left:${-(contentBound.width + arrowBound.width / 2)}px;top:${-(contentBound.height - targetBound.height)}px`,
            arrow: `transform:rotate(45deg);right:${-arrowBound.width / 2}px;bottom:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px`,
          },
          {
            at: 'right-start',
            check1: atRight,
            check2: window.innerHeight - (targetBound.top + contentBound.height),
            check3: 0,
            style: `left:${targetBound.width + arrowBound.width / 2}px`,
            arrow: `transform:rotate(45deg);left:${-arrowBound.width}px;top:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px;`,
          },
          {
            at: 'right-center',
            check1: atRight,
            check2: contentBound.y - (contentBound.height / 2 + targetBound.height / 2),
            check3: window.innerHeight - (contentBound.y - (contentBound.height / 2 + targetBound.height / 2) + contentBound.height),
            style: `top:${-(contentBound.height / 2 - targetBound.height / 2)}px;left:${targetBound.width + arrowBound.width / 2}px`,
            arrow: `left:${-arrowBound.width}px;top:${contentBound.height / 2 - arrowClientH / 2}px;transform:rotate(45deg)`,
          },
          {
            at: 'right-end',
            check1: atRight,
            check2: targetBound.bottom - contentBound.height,
            check3: 0,
            style: `left:${targetBound.width + arrowBound.width / 2}px;top:${-(contentBound.height - targetBound.height)}px`,
            arrow: `transform:rotate(45deg);left:${-arrowBound.width}px;bottom:${Math.min(targetBound.height / 2, contentBound.height) - arrowClientH / 2}px`,
          },
          {
            at: 'bottom-start',
            check1: atBottom,
            check2: window.innerWidth - (targetBound.left + contentBound.width),
            check3: 0,
            left: `top:${targetBound.height + arrowBound.height / 2}px;left:0px`,
            arrow: `transform:rotate(-45deg);top:${-(arrowBound.height / 2)}px;left:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
          },
          {
            at: 'bottom-center',
            check1: atBottom,
            check2: contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2,
            check3: window.innerWidth - (contentBound.x - targetBound.width - contentBound.width / 2 + targetBound.width / 2 + contentBound.width),
            style: `top:${targetBound.height + arrowClientH / 2}px;left:${-(contentBound.width / 2) + targetBound.width / 2}px`,
            arrow: `transform:rotate(-45deg);top:${-arrowClientH / 2}px;left:${contentBound.width / 2 - arrowBound.width / 2}px`,
          },
          {
            at: 'bottom-end',
            check1: atBottom,
            check2: atLeft,
            check3: 0,
            style: `top:${targetBound.height + arrowBound.height / 2}px;left:${-(contentBound.width - targetBound.width)}px`,
            arrow: `transform:rotate(-45deg);top:${-(arrowBound.height / 2)}px;right:${Math.min(targetBound.width / 2, contentBound.width) - arrowBound.width / 2}px`,
          },
        ];

        const compute = pos.map(val => val.check1 - (val.check2 - val.check3));
        const getIndex = compute.indexOf(Math.max(...compute));

        let get;
        if (placement !== 'auto') {
          get = pos.filter(val => val.at === placement)[0];
        } else {
          get = pos[getIndex];
        }
        $$invalidate('positionStyle', positionStyle = get.style);
        $$invalidate('arrowStyle', arrowStyle = get.arrow);
      };

      onMount(() => {
        calculate();

        dispatch('open');
      });

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('arrowRef', arrowRef = $$value);
    		});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('contentRef', contentRef = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('arrowColor' in $$props) $$invalidate('arrowColor', arrowColor = $$props.arrowColor);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    		if ('targetRef' in $$props) $$invalidate('targetRef', targetRef = $$props.targetRef);
    		if ('zIndex' in $$props) $$invalidate('zIndex', zIndex = $$props.zIndex);
    		if ('arrow' in $$props) $$invalidate('arrow', arrow = $$props.arrow);
    		if ('placement' in $$props) $$invalidate('placement', placement = $$props.placement);
    		if ('action' in $$props) $$invalidate('action', action = $$props.action);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		arrowColor,
    		open,
    		targetRef,
    		zIndex,
    		arrow,
    		placement,
    		action,
    		contentRef,
    		arrowRef,
    		positionStyle,
    		arrowStyle,
    		setOpen,
    		div_binding,
    		div_binding_1,
    		$$slots,
    		$$scope
    	};
    }

    class Content extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1kx3zk8-style")) add_css$1();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["arrowColor", "open", "targetRef", "zIndex", "arrow", "placement", "action"]);
    	}
    }

    /* src\index.svelte generated by Svelte v3.12.1 */

    function add_css$2() {
    	var style = element("style");
    	style.id = 'svelte-13ecfb7-style';
    	style.textContent = ".target.svelte-13ecfb7{display:inline-block;position:relative}.popover.svelte-13ecfb7{position:relative}";
    	append(document.head, style);
    }

    const get_content_slot_changes = () => ({});
    const get_content_slot_context = () => ({});

    const get_target_slot_changes = ({ open }) => ({ open: open });
    const get_target_slot_context = ({ open }) => ({ open: open });

    // (15:2) {#if open}
    function create_if_block$1(ctx) {
    	var current;

    	var content = new Content({
    		props: {
    		placement: ctx.placement,
    		targetRef: ctx.targetRef,
    		open: ctx.open,
    		zIndex: ctx.zIndex,
    		arrow: ctx.arrow,
    		action: ctx.action,
    		arrowColor: ctx.arrowColor,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	}
    	});
    	content.$on("open", ctx.onOpen);
    	content.$on("setOpen", ctx.setOpen);

    	return {
    		c() {
    			content.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var content_changes = {};
    			if (changed.placement) content_changes.placement = ctx.placement;
    			if (changed.targetRef) content_changes.targetRef = ctx.targetRef;
    			if (changed.open) content_changes.open = ctx.open;
    			if (changed.zIndex) content_changes.zIndex = ctx.zIndex;
    			if (changed.arrow) content_changes.arrow = ctx.arrow;
    			if (changed.action) content_changes.action = ctx.action;
    			if (changed.arrowColor) content_changes.arrowColor = ctx.arrowColor;
    			if (changed.$$scope) content_changes.$$scope = { changed, ctx };
    			content.$set(content_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(content, detaching);
    		}
    	};
    }

    // (16:4) <Content on:open={onOpen} on:setOpen={setOpen} {placement} {targetRef} {open} {zIndex} {arrow} {action} {arrowColor}>
    function create_default_slot(ctx) {
    	var current;

    	const content_slot_template = ctx.$$slots.content;
    	const content_slot = create_slot(content_slot_template, ctx, get_content_slot_context);

    	return {
    		c() {
    			if (content_slot) content_slot.c();
    		},

    		l(nodes) {
    			if (content_slot) content_slot.l(nodes);
    		},

    		m(target, anchor) {
    			if (content_slot) {
    				content_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p(changed, ctx) {
    			if (content_slot && content_slot.p && changed.$$scope) {
    				content_slot.p(
    					get_slot_changes(content_slot_template, ctx, changed, get_content_slot_changes),
    					get_slot_context(content_slot_template, ctx, get_content_slot_context)
    				);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			current = true;
    		},

    		o(local) {
    			transition_out(content_slot, local);
    			current = false;
    		},

    		d(detaching) {
    			if (content_slot) content_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var div1, div0, div0_style_value, t, current, dispose;

    	const target_slot_template = ctx.$$slots.target;
    	const target_slot = create_slot(target_slot_template, ctx, get_target_slot_context);

    	var if_block = (ctx.open) && create_if_block$1(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");

    			if (target_slot) target_slot.c();
    			t = space();
    			if (if_block) if_block.c();

    			attr(div0, "class", "target svelte-13ecfb7");
    			attr(div0, "style", div0_style_value = ctx.open ? `z-index: ${ctx.zIndex + 10}` : '');
    			attr(div1, "class", "popover svelte-13ecfb7");

    			dispose = [
    				listen(div0, "click", ctx.onClick),
    				listen(div0, "touchend", ctx.onTouchEnd),
    				listen(div0, "mouseover", ctx.onMouseOver),
    				listen(div0, "mouseout", ctx.onMouseOut)
    			];
    		},

    		l(nodes) {
    			if (target_slot) target_slot.l(div0_nodes);
    		},

    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			if (target_slot) {
    				target_slot.m(div0, null);
    			}

    			ctx.div0_binding(div0);
    			append(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},

    		p(changed, ctx) {
    			if (target_slot && target_slot.p && (changed.$$scope || changed.open)) {
    				target_slot.p(
    					get_slot_changes(target_slot_template, ctx, changed, get_target_slot_changes),
    					get_slot_context(target_slot_template, ctx, get_target_slot_context)
    				);
    			}

    			if ((!current || changed.open || changed.zIndex) && div0_style_value !== (div0_style_value = ctx.open ? `z-index: ${ctx.zIndex + 10}` : '')) {
    				attr(div0, "style", div0_style_value);
    			}

    			if (ctx.open) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(target_slot, local);
    			transition_in(if_block);
    			current = true;
    		},

    		o(local) {
    			transition_out(target_slot, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (target_slot) target_slot.d(detaching);
    			ctx.div0_binding(null);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    const DEFAULT_ZINDEX = 1000;

    function instance$2($$self, $$props, $$invalidate) {
    	
      let targetRef;
      const dispatch = createEventDispatcher();

      const onOpen = () => {
        dispatch('open');
      };

      let { action = 'click', zIndex = DEFAULT_ZINDEX, arrow = true, placement = 'auto', arrowColor = '', preventDefault = false, stopPropagation = false, open = false } = $$props;

      const setOpen = () => {
        $$invalidate('open', open = !open);
        if (!open) {
          dispatch('close');
        }
      };
      const eventClick = e => {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        setOpen();
      };
      const eventMouseOut = ({ relatedTarget }) => {
        if (relatedTarget.id === 'overlay' && !open) {
          setOpen();
        }
      };

      const onTouchEnd = action === 'click' ? eventClick : null;
      const onClick = action === 'click' ? eventClick : null;

      const setOpenTrue = () => ($$invalidate('open', open = true));

      const onMouseOver = action === 'hover' ? setOpenTrue : null;
      const onMouseOut = action === 'hover' ? eventMouseOut : null;

    	let { $$slots = {}, $$scope } = $$props;

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('targetRef', targetRef = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('action' in $$props) $$invalidate('action', action = $$props.action);
    		if ('zIndex' in $$props) $$invalidate('zIndex', zIndex = $$props.zIndex);
    		if ('arrow' in $$props) $$invalidate('arrow', arrow = $$props.arrow);
    		if ('placement' in $$props) $$invalidate('placement', placement = $$props.placement);
    		if ('arrowColor' in $$props) $$invalidate('arrowColor', arrowColor = $$props.arrowColor);
    		if ('preventDefault' in $$props) $$invalidate('preventDefault', preventDefault = $$props.preventDefault);
    		if ('stopPropagation' in $$props) $$invalidate('stopPropagation', stopPropagation = $$props.stopPropagation);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		targetRef,
    		onOpen,
    		action,
    		zIndex,
    		arrow,
    		placement,
    		arrowColor,
    		preventDefault,
    		stopPropagation,
    		open,
    		setOpen,
    		onTouchEnd,
    		onClick,
    		onMouseOver,
    		onMouseOut,
    		div0_binding,
    		$$slots,
    		$$scope
    	};
    }

    class Index extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-13ecfb7-style")) add_css$2();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["action", "zIndex", "arrow", "placement", "arrowColor", "preventDefault", "stopPropagation", "open"]);
    	}
    }

    return Index;

}));
