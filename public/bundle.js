
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
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
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    const globals = (typeof window !== 'undefined' ? window : global);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const RENDERER = {};
    const LAYER = {};
    const PARENT = {};

    function get_scene() {
    	return getContext(RENDERER);
    }

    function get_layer() {
    	return getContext(LAYER);
    }

    function get_parent() {
    	return getContext(PARENT);
    }

    function set_parent(parent) {
    	setContext(PARENT, parent);
    }

    function remove_index(array, index) {
    	array[index] = array[array.length - 1];
    	array.pop();
    }

    function remove_item(array, item) {
    	const index = array.indexOf(item);
    	if (~index) remove_index(array, index);
    }

    function create_layer(index, invalidate) {
    	let child_index = 0;

    	const meshes = [];
    	const transparent_meshes = [];
    	const child_layers = [];

    	const layer = {
    		index: 0,
    		meshes,
    		transparent_meshes,
    		child_layers,
    		needs_sort: false,
    		needs_transparency_sort: true,
    		add_mesh: (mesh, existing) => {
    			if (existing) {
    				remove_item(mesh.transparent ? meshes : transparent_meshes, mesh);
    			}

    			if (mesh.transparent) {
    				transparent_meshes.push(mesh);
    				layer.needs_transparency_sort = true;
    			} else {
    				meshes.push(mesh);
    			}

    			onDestroy(() => {
    				remove_item(meshes, mesh);
    				remove_item(transparent_meshes, mesh);
    				invalidate();
    			});
    		},
    		add_child: (index = child_index++) => {
    			const child_layer = create_layer(index, invalidate);
    			child_layers.push(child_layer);

    			layer.needs_sort = true;

    			onDestroy(() => {
    				remove_item(child_layers, child_layer);

    				layer.needs_sort = true;
    				invalidate();
    			});

    			return child_layer;
    		}
    	};

    	return layer;
    }

    function process_color(color) {
    	if (typeof color === 'number') {
    		const r = (color & 0xff0000) >> 16;
    		const g = (color & 0x00ff00) >> 8;
    		const b = (color & 0x0000ff);

    		return new Float32Array([
    			r / 255,
    			g / 255,
    			b / 255
    		]);
    	}

    	return color;
    }

    function normalize(out, vector = out) {
    	let total = 0;
    	for (let i = 0; i < vector.length; i += 1) {
    		total += vector[i] * vector[i];
    	}

    	const mag = Math.sqrt(total);

    	out[0] = vector[0] / mag;
    	out[1] = vector[1] / mag;
    	out[2] = vector[2] / mag;

    	return out;
    }

    function memoize(fn) {
    	const cache = new Map();
    	return (...args) => {
    		const hash = JSON.stringify(args);
    		if (!cache.has(hash)) cache.set(hash, fn(...args));
    		return cache.get(hash);
    	};
    }

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Transpose the values of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */

    function transpose(out, a) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        var a12 = a[6],
            a13 = a[7];
        var a23 = a[11];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
      } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
      }

      return out;
    }
    /**
     * Inverts a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */

    function invert(out, a) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15];
      var b00 = a00 * a11 - a01 * a10;
      var b01 = a00 * a12 - a02 * a10;
      var b02 = a00 * a13 - a03 * a10;
      var b03 = a01 * a12 - a02 * a11;
      var b04 = a01 * a13 - a03 * a11;
      var b05 = a02 * a13 - a03 * a12;
      var b06 = a20 * a31 - a21 * a30;
      var b07 = a20 * a32 - a22 * a30;
      var b08 = a20 * a33 - a23 * a30;
      var b09 = a21 * a32 - a22 * a31;
      var b10 = a21 * a33 - a23 * a31;
      var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

      if (!det) {
        return null;
      }

      det = 1.0 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return out;
    }
    /**
     * Multiplies two mat4s
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */

    function multiply(out, a, b) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15]; // Cache only the current line of the second matrix

      var b0 = b[0],
          b1 = b[1],
          b2 = b[2],
          b3 = b[3];
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to translate
     * @param {vec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {vec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/

    function scale(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Creates a matrix from a quaternion rotation, vector translation and vector scale
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, vec);
     *     let quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     mat4.multiply(dest, quatMat);
     *     mat4.scale(dest, scale)
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat4} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @param {vec3} s Scaling vector
     * @returns {mat4} out
     */

    function fromRotationTranslationScale(out, q, v, s) {
      // Quaternion math
      var x = q[0],
          y = q[1],
          z = q[2],
          w = q[3];
      var x2 = x + x;
      var y2 = y + y;
      var z2 = z + z;
      var xx = x * x2;
      var xy = x * y2;
      var xz = x * z2;
      var yy = y * y2;
      var yz = y * z2;
      var zz = z * z2;
      var wx = w * x2;
      var wy = w * y2;
      var wz = w * z2;
      var sx = s[0];
      var sy = s[1];
      var sz = s[2];
      out[0] = (1 - (yy + zz)) * sx;
      out[1] = (xy + wz) * sx;
      out[2] = (xz - wy) * sx;
      out[3] = 0;
      out[4] = (xy - wz) * sy;
      out[5] = (1 - (xx + zz)) * sy;
      out[6] = (yz + wx) * sy;
      out[7] = 0;
      out[8] = (xz + wy) * sz;
      out[9] = (yz - wx) * sz;
      out[10] = (1 - (xx + yy)) * sz;
      out[11] = 0;
      out[12] = v[0];
      out[13] = v[1];
      out[14] = v[2];
      out[15] = 1;
      return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

      return out;
    }
    /**
     * Generates a matrix that makes something look at something else.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function targetTo(out, eye, target, up) {
      var eyex = eye[0],
          eyey = eye[1],
          eyez = eye[2],
          upx = up[0],
          upy = up[1],
          upz = up[2];
      var z0 = eyex - target[0],
          z1 = eyey - target[1],
          z2 = eyez - target[2];
      var len = z0 * z0 + z1 * z1 + z2 * z2;

      if (len > 0) {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
      }

      var x0 = upy * z2 - upz * z1,
          x1 = upz * z0 - upx * z2,
          x2 = upx * z1 - upy * z0;
      len = x0 * x0 + x1 * x1 + x2 * x2;

      if (len > 0) {
        len = 1 / Math.sqrt(len);
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      out[0] = x0;
      out[1] = x1;
      out[2] = x2;
      out[3] = 0;
      out[4] = z1 * x2 - z2 * x1;
      out[5] = z2 * x0 - z0 * x2;
      out[6] = z0 * x1 - z1 * x0;
      out[7] = 0;
      out[8] = z0;
      out[9] = z1;
      out[10] = z2;
      out[11] = 0;
      out[12] = eyex;
      out[13] = eyey;
      out[14] = eyez;
      out[15] = 1;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$1() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */

    function length(a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      return Math.hypot(x, y, z);
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues(x, y, z) {
      var out = new ARRAY_TYPE(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */

    function normalize$1(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;

      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */

    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */

    function cross(out, a, b) {
      var ax = a[0],
          ay = a[1],
          az = a[2];
      var bx = b[0],
          by = b[1],
          bz = b[2];
      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    }
    /**
     * Transforms the vec3 with a mat4.
     * 4th vector component is implicitly '1'
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec3} out
     */

    function transformMat4(out, a, m) {
      var x = a[0],
          y = a[1],
          z = a[2];
      var w = m[3] * x + m[7] * y + m[11] * z + m[15];
      w = w || 1.0;
      out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
      out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
      out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
      return out;
    }
    /**
     * Alias for {@link vec3.length}
     * @function
     */

    var len = length;
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    var forEach = function () {
      var vec = create$1();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    }();

    /* node_modules/@sveltejs/gl/scene/Scene.svelte generated by Svelte v3.12.1 */
    const { Error: Error_1 } = globals;

    const file = "node_modules/@sveltejs/gl/scene/Scene.svelte";

    const get_default_slot_changes = ({ $width, $height }) => ({ width: $width, height: $height });
    const get_default_slot_context = ({ $width, $height }) => ({
    	width: $width,
    	height: $height
    });

    // (409:1) {#if gl}
    function create_if_block(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.$width || changed.$height)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(409:1) {#if gl}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div, canvas_1, t, div_resize_listener, current;

    	var if_block = (ctx.gl) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas_1 = element("canvas");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(canvas_1, "class", "svelte-6pzapg");
    			add_location(canvas_1, file, 406, 1, 10430);
    			add_render_callback(() => ctx.div_resize_handler.call(div));
    			attr_dev(div, "class", "container svelte-6pzapg");
    			add_location(div, file, 405, 0, 10351);
    		},

    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas_1);
    			ctx.canvas_1_binding(canvas_1);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, ctx.div_resize_handler.bind(div));
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.gl) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			ctx.canvas_1_binding(null);
    			if (if_block) if_block.d();
    			div_resize_listener.cancel();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function is_intersecting(el) {
    	// TODO this shouldn't be necessary. But the initial value
    	// of entry.isIntersecting in an IO can be incorrect, it
    	// turns out? need to investigate further
    	const bcr = el.getBoundingClientRect();

    	return (
    		bcr.bottom > 0 &&
    		bcr.right  > 0 &&
    		bcr.top    < window.innerHeight &&
    		bcr.left   < window.innerWidth
    	);
    }

    function get_visibility(node) {
    	return readable(false, set => {
    		if (typeof IntersectionObserver !== 'undefined') {
    			const observer = new IntersectionObserver(entries => {
    				// set(entries[0].isIntersecting);
    				set(is_intersecting(node));
    			});

    			observer.observe(node);
    			return () => observer.unobserve(node);
    		}

    		if (typeof window !== 'undefined') {
    			function handler() {
    				const { top, bottom } = node.getBoundingClientRect();
    				set(bottom > 0 && top < window.innerHeight);
    			}

    			window.addEventListener('scroll', handler);
    			window.addEventListener('resize', handler);

    			return () => {
    				window.removeEventListener('scroll', handler);
    				window.removeEventListener('resize', handler);
    			};
    		}
    	});
    }

    const num_lights = 8;

    function instance($$self, $$props, $$invalidate) {
    	let $width, $height, $visible, $$unsubscribe_visible = noop, $$subscribe_visible = () => ($$unsubscribe_visible(), $$unsubscribe_visible = subscribe(visible, $$value => { $visible = $$value; $$invalidate('$visible', $visible); }), visible);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_visible());

    	

    	let { background = [1, 1, 1], backgroundOpacity = 1, fog = undefined, pixelRatio = undefined } = $$props;

    	const use_fog = 'fog' in $$props;

    	let canvas;
    	let visible = writable(false); $$subscribe_visible();
    	let pending = false;
    	let w;
    	let h;

    	let gl;
    	let draw;
    	let camera_stores = {
    		camera_matrix: writable(),
    		view: writable(),
    		projection: writable()
    	};

    	const invalidate = typeof window !== 'undefined'
    		? () => {
    			if (!update_scheduled) {
    				update_scheduled = true;
    				resolved.then(draw);
    			}
    		}
    		: () => {};

    	const width = writable(1); validate_store(width, 'width'); component_subscribe($$self, width, $$value => { $width = $$value; $$invalidate('$width', $width); });
    	const height = writable(1); validate_store(height, 'height'); component_subscribe($$self, height, $$value => { $height = $$value; $$invalidate('$height', $height); });

    	const root_layer = create_layer(0, invalidate);

    	const default_camera = { /* TODO */ };
    	let camera = default_camera;

    	// lights
    	const lights = {
    		ambient: [],
    		directional: [],
    		point: []
    	};

    	let update_scheduled = false;
    	let resolved = Promise.resolve();

    	function add_to(array) {
    		return fn => {
    			array.push(fn);
    			invalidate();

    			onDestroy(() => {
    				const i = array.indexOf(fn);
    				if (~i) array.splice(i, 1);
    				invalidate();
    			});
    		}
    	}

    	const targets = new Map();
    	let camera_position_changed_since_last_render = true;

    	const scene = {
    		defines: [
    			`#define NUM_LIGHTS 2\n` + // TODO configure this
    			`#define USE_FOG ${use_fog}\n`
    		].join(''),

    		add_camera: _camera => {
    			if (camera && camera !== default_camera) {
    				throw new Error(`A scene can only have one camera`);
    			}

    			camera = _camera;
    			invalidate();

    			// TODO this is garbage
    			camera_stores.camera_matrix.set(camera.matrix);
    			camera_stores.projection.set(camera.projection);
    			camera_stores.view.set(camera.view);

    			onDestroy(() => {
    				camera = default_camera;
    				invalidate();
    			});
    		},

    		update_camera: camera => {
    			// for overlays
    			camera_stores.camera_matrix.set(camera.matrix);
    			camera_stores.view.set(camera.view);
    			camera_stores.projection.set(camera.projection);

    			camera_position_changed_since_last_render = true;
    			invalidate();
    		},

    		add_directional_light: add_to(lights.directional),
    		add_point_light: add_to(lights.point),
    		add_ambient_light: add_to(lights.ambient),

    		get_target(id) {
    			if (!targets.has(id)) targets.set(id, writable(null));
    			return targets.get(id);
    		},

    		invalidate,

    		...camera_stores,

    		width,
    		height
    	};

    	setContext(RENDERER, scene);
    	setContext(LAYER, root_layer);

    	const origin = identity(create());
    	const ctm = writable(origin);
    	setContext(PARENT, {
    		get_matrix_world: () => origin,
    		ctm: { subscribe: ctm.subscribe }
    	});

    	onMount(() => {
    		$$invalidate('scene', scene.canvas = canvas, scene);
    		$$invalidate('gl', gl = $$invalidate('scene', scene.gl = canvas.getContext('webgl'), scene));
    		$$subscribe_visible($$invalidate('visible', visible = get_visibility(canvas)));

    		const extensions = [
    			'OES_element_index_uint',
    			'OES_standard_derivatives'
    		];

    		extensions.forEach(name => {
    			const ext = gl.getExtension(name);
    			if (!ext) {
    				throw new Error(`Unsupported extension: ${name}`);
    			}
    		});

    		draw = force => {
    			if (!camera) return; // TODO make this `!ready` or something instead

    			if (dimensions_need_update) {
    				const DPR = pixelRatio || window.devicePixelRatio || 1;
    				$$invalidate('canvas', canvas.width = $width * DPR, canvas);
    				$$invalidate('canvas', canvas.height = $height * DPR, canvas);
    				gl.viewport(0, 0, $width * DPR, $height * DPR);

    				dimensions_need_update = false;
    			}

    			update_scheduled = false;

    			if (!$visible && !force) {
    				$$invalidate('pending', pending = true);
    				return;
    			}
    			$$invalidate('pending', pending = false);

    			gl.clearColor(...bg, backgroundOpacity);
    			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    			gl.enable(gl.CULL_FACE);
    			gl.enable(gl.BLEND);

    			// calculate total ambient light
    			const ambient_light = lights.ambient.reduce((total, { color, intensity }) => {
    				return [
    					Math.min(total[0] + color[0] * intensity, 1),
    					Math.min(total[1] + color[1] * intensity, 1),
    					Math.min(total[2] + color[2] * intensity, 1)
    				];
    			}, new Float32Array([0, 0, 0]));

    			let previous_program;

    			function render_mesh({ model, model_inverse_transpose, geometry, material }) {
    				// TODO should this even be possible?
    				if (!material) return;

    				if (material.depthTest !== false) {
    					gl.enable(gl.DEPTH_TEST);
    				} else {
    					gl.disable(gl.DEPTH_TEST);
    				}

    				gl.blendFuncSeparate(
    					gl.SRC_ALPHA, // source rgb
    					gl.ONE_MINUS_SRC_ALPHA, // dest rgb
    					gl.SRC_ALPHA, // source alpha
    					gl.ONE // dest alpha
    				);

    				if (material.program !== previous_program) {
    					previous_program = material.program;

    					// TODO move logic to the mesh/material?
    					gl.useProgram(material.program);

    					// set built-ins
    					gl.uniform3fv(material.uniform_locations.AMBIENT_LIGHT, ambient_light);

    					if (use_fog) {
    						gl.uniform3fv(material.uniform_locations.FOG_COLOR, bg);
    						gl.uniform1f(material.uniform_locations.FOG_DENSITY, fog);
    					}

    					if (material.uniform_locations.DIRECTIONAL_LIGHTS) {
    						for (let i = 0; i < num_lights; i += 1) {
    							const light = lights.directional[i];
    							if (!light) break;

    							gl.uniform3fv(material.uniform_locations.DIRECTIONAL_LIGHTS[i].direction, light.direction);
    							gl.uniform3fv(material.uniform_locations.DIRECTIONAL_LIGHTS[i].color, light.color);
    							gl.uniform1f(material.uniform_locations.DIRECTIONAL_LIGHTS[i].intensity, light.intensity);
    						}
    					}

    					if (material.uniform_locations.POINT_LIGHTS) {
    						for (let i = 0; i < num_lights; i += 1) {
    							const light = lights.point[i];
    							if (!light) break;

    							gl.uniform3fv(material.uniform_locations.POINT_LIGHTS[i].location, light.location);
    							gl.uniform3fv(material.uniform_locations.POINT_LIGHTS[i].color, light.color);
    							gl.uniform1f(material.uniform_locations.POINT_LIGHTS[i].intensity, light.intensity);
    						}
    					}

    					gl.uniform3fv(material.uniform_locations.CAMERA_WORLD_POSITION, camera.world_position);
    					gl.uniformMatrix4fv(material.uniform_locations.VIEW, false, camera.view);
    					gl.uniformMatrix4fv(material.uniform_locations.PROJECTION, false, camera.projection);
    				}

    				// set mesh-specific built-in uniforms
    				gl.uniformMatrix4fv(material.uniform_locations.MODEL, false, model);
    				gl.uniformMatrix4fv(material.uniform_locations.MODEL_INVERSE_TRANSPOSE, false, model_inverse_transpose);

    				// set material-specific built-in uniforms
    				material.apply_uniforms(gl);

    				// set attributes
    				geometry.set_attributes(gl);

    				// draw
    				if (geometry.index) {
    					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.buffers.__index);
    					gl.drawElements(gl[geometry.primitive], geometry.index.length, gl.UNSIGNED_INT, 0);
    				} else {
    					const primitiveType = gl[geometry.primitive];
    					gl.drawArrays(primitiveType, 0, geometry.count);
    				}
    			}

    			function render_layer(layer) {
    				if (layer.needs_sort) {
    					layer.child_layers.sort((a, b) => a.index - b.index);
    					layer.needs_sort = false;
    				}

    				gl.depthMask(true);
    				gl.clearDepth(1.0);
    				gl.clear(gl.DEPTH_BUFFER_BIT);

    				for (let i = 0; i < layer.meshes.length; i += 1) {
    					render_mesh(layer.meshes[i]);
    				}

    				// TODO sort transparent meshes, furthest to closest
    				gl.depthMask(false);

    				if (camera_position_changed_since_last_render || layer.needs_transparency_sort) {
    					sort_transparent_meshes(layer.transparent_meshes);
    					layer.needs_transparency_sort = false;
    				}

    				for (let i = 0; i < layer.transparent_meshes.length; i += 1) {
    					render_mesh(layer.transparent_meshes[i]);
    				}

    				for (let i = 0; i < layer.child_layers.length; i += 1) {
    					render_layer(layer.child_layers[i]);
    				}
    			}

    			render_layer(root_layer);
    			camera_position_changed_since_last_render = false;
    		};

    		// for some wacky reason, Adblock Plus seems to prevent the
    		// initial dimensions from being correctly reported
    		const timeout = setTimeout(() => {
    			set_store_value(width, $width = canvas.clientWidth);
    			set_store_value(height, $height = canvas.clientHeight);
    		});

    		tick().then(() => draw(true));

    		return () => {
    			gl.getExtension('WEBGL_lose_context').loseContext();
    			clearTimeout(timeout);
    		};
    	});

    	const sort_transparent_meshes = meshes => {
    		if (meshes.length < 2) return;

    		const lookup = new Map();
    		const out = new Float32Array(16);

    		meshes.forEach(mesh => {
    			const z = multiply(out, camera.view, mesh.model)[14];
    			lookup.set(mesh, z);
    		});

    		meshes.sort((a, b) => lookup.get(a) - lookup.get(b));
    	};

    	let dimensions_need_update = true;

    	const update_dimensions = () => {
    		dimensions_need_update = true;
    		invalidate();
    	};

    	let { $$slots = {}, $$scope } = $$props;

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('canvas', canvas = $$value);
    		});
    	}

    	function div_resize_handler() {
    		width.set(this.clientWidth);
    		height.set(this.clientHeight);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('background' in $$new_props) $$invalidate('background', background = $$new_props.background);
    		if ('backgroundOpacity' in $$new_props) $$invalidate('backgroundOpacity', backgroundOpacity = $$new_props.backgroundOpacity);
    		if ('fog' in $$new_props) $$invalidate('fog', fog = $$new_props.fog);
    		if ('pixelRatio' in $$new_props) $$invalidate('pixelRatio', pixelRatio = $$new_props.pixelRatio);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { background, backgroundOpacity, fog, pixelRatio, canvas, visible, pending, w, h, gl, draw, camera_stores, camera, update_scheduled, resolved, camera_position_changed_since_last_render, dimensions_need_update, bg, $width, $height, $visible };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('background' in $$props) $$invalidate('background', background = $$new_props.background);
    		if ('backgroundOpacity' in $$props) $$invalidate('backgroundOpacity', backgroundOpacity = $$new_props.backgroundOpacity);
    		if ('fog' in $$props) $$invalidate('fog', fog = $$new_props.fog);
    		if ('pixelRatio' in $$props) $$invalidate('pixelRatio', pixelRatio = $$new_props.pixelRatio);
    		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$new_props.canvas);
    		if ('visible' in $$props) $$subscribe_visible($$invalidate('visible', visible = $$new_props.visible));
    		if ('pending' in $$props) $$invalidate('pending', pending = $$new_props.pending);
    		if ('w' in $$props) w = $$new_props.w;
    		if ('h' in $$props) h = $$new_props.h;
    		if ('gl' in $$props) $$invalidate('gl', gl = $$new_props.gl);
    		if ('draw' in $$props) draw = $$new_props.draw;
    		if ('camera_stores' in $$props) camera_stores = $$new_props.camera_stores;
    		if ('camera' in $$props) camera = $$new_props.camera;
    		if ('update_scheduled' in $$props) update_scheduled = $$new_props.update_scheduled;
    		if ('resolved' in $$props) resolved = $$new_props.resolved;
    		if ('camera_position_changed_since_last_render' in $$props) camera_position_changed_since_last_render = $$new_props.camera_position_changed_since_last_render;
    		if ('dimensions_need_update' in $$props) dimensions_need_update = $$new_props.dimensions_need_update;
    		if ('bg' in $$props) bg = $$new_props.bg;
    		if ('$width' in $$props) width.set($width);
    		if ('$height' in $$props) height.set($height);
    		if ('$visible' in $$props) visible.set($visible);
    	};

    	let bg;

    	$$self.$$.update = ($$dirty = { background: 1, $width: 1, $height: 1, backgroundOpacity: 1, fog: 1, scene: 1, $visible: 1, pending: 1 }) => {
    		if ($$dirty.background) { bg = process_color(background); }
    		if ($$dirty.$width || $$dirty.$height) { (update_dimensions()); }
    		if ($$dirty.background || $$dirty.backgroundOpacity || $$dirty.fog || $$dirty.scene) { (scene.invalidate()); }
    		if ($$dirty.$visible || $$dirty.pending || $$dirty.scene) { if ($visible && pending) scene.invalidate(); }
    	};

    	return {
    		background,
    		backgroundOpacity,
    		fog,
    		pixelRatio,
    		canvas,
    		visible,
    		gl,
    		width,
    		height,
    		$width,
    		$height,
    		canvas_1_binding,
    		div_resize_handler,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Scene extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["background", "backgroundOpacity", "fog", "pixelRatio"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Scene", options, id: create_fragment.name });
    	}

    	get background() {
    		throw new Error_1("<Scene>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error_1("<Scene>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundOpacity() {
    		throw new Error_1("<Scene>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundOpacity(value) {
    		throw new Error_1("<Scene>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fog() {
    		throw new Error_1("<Scene>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fog(value) {
    		throw new Error_1("<Scene>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pixelRatio() {
    		throw new Error_1("<Scene>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pixelRatio(value) {
    		throw new Error_1("<Scene>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * 3x3 Matrix
     * @module mat3
     */

    /**
     * Creates a new identity mat3
     *
     * @returns {mat3} a new 3x3 matrix
     */

    function create$2() {
      var out = new ARRAY_TYPE(9);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
      }

      out[0] = 1;
      out[4] = 1;
      out[8] = 1;
      return out;
    }

    /**
     * 4 Dimensional Vector
     * @module vec4
     */

    /**
     * Creates a new, empty vec4
     *
     * @returns {vec4} a new 4D vector
     */

    function create$3() {
      var out = new ARRAY_TYPE(4);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
      }

      return out;
    }
    /**
     * Normalize a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to normalize
     * @returns {vec4} out
     */

    function normalize$2(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var w = a[3];
      var len = x * x + y * y + z * z + w * w;

      if (len > 0) {
        len = 1 / Math.sqrt(len);
      }

      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      out[3] = w * len;
      return out;
    }
    /**
     * Perform some operation over an array of vec4s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    var forEach$1 = function () {
      var vec = create$3();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 4;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          vec[3] = a[i + 3];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
          a[i + 3] = vec[3];
        }

        return a;
      };
    }();

    /**
     * Quaternion
     * @module quat
     */

    /**
     * Creates a new identity quat
     *
     * @returns {quat} a new quaternion
     */

    function create$4() {
      var out = new ARRAY_TYPE(4);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      out[3] = 1;
      return out;
    }
    /**
     * Sets a quat from the given angle and rotation axis,
     * then returns it.
     *
     * @param {quat} out the receiving quaternion
     * @param {vec3} axis the axis around which to rotate
     * @param {Number} rad the angle in radians
     * @returns {quat} out
     **/

    function setAxisAngle(out, axis, rad) {
      rad = rad * 0.5;
      var s = Math.sin(rad);
      out[0] = s * axis[0];
      out[1] = s * axis[1];
      out[2] = s * axis[2];
      out[3] = Math.cos(rad);
      return out;
    }
    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     */

    function slerp(out, a, b, t) {
      // benchmarks:
      //    http://jsperf.com/quaternion-slerp-implementations
      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3];
      var bx = b[0],
          by = b[1],
          bz = b[2],
          bw = b[3];
      var omega, cosom, sinom, scale0, scale1; // calc cosine

      cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

      if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      } // calculate coefficients


      if (1.0 - cosom > EPSILON) {
        // standard case (slerp)
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        // "from" and "to" quaternions are very close
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
      } // calculate final values


      out[0] = scale0 * ax + scale1 * bx;
      out[1] = scale0 * ay + scale1 * by;
      out[2] = scale0 * az + scale1 * bz;
      out[3] = scale0 * aw + scale1 * bw;
      return out;
    }
    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     *
     * NOTE: The resultant quaternion is not normalized, so you should be sure
     * to renormalize the quaternion yourself where necessary.
     *
     * @param {quat} out the receiving quaternion
     * @param {mat3} m rotation matrix
     * @returns {quat} out
     * @function
     */

    function fromMat3(out, m) {
      // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
      // article "Quaternion Calculus and Fast Animation".
      var fTrace = m[0] + m[4] + m[8];
      var fRoot;

      if (fTrace > 0.0) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0); // 2w

        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)

        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
      } else {
        // |w| <= 1/2
        var i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        var j = (i + 1) % 3;
        var k = (i + 2) % 3;
        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
      }

      return out;
    }
    /**
     * Creates a quaternion from the given euler angle x, y, z.
     *
     * @param {quat} out the receiving quaternion
     * @param {x} Angle to rotate around X axis in degrees.
     * @param {y} Angle to rotate around Y axis in degrees.
     * @param {z} Angle to rotate around Z axis in degrees.
     * @returns {quat} out
     * @function
     */

    function fromEuler(out, x, y, z) {
      var halfToRad = 0.5 * Math.PI / 180.0;
      x *= halfToRad;
      y *= halfToRad;
      z *= halfToRad;
      var sx = Math.sin(x);
      var cx = Math.cos(x);
      var sy = Math.sin(y);
      var cy = Math.cos(y);
      var sz = Math.sin(z);
      var cz = Math.cos(z);
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      return out;
    }
    /**
     * Normalize a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quaternion to normalize
     * @returns {quat} out
     * @function
     */

    var normalize$3 = normalize$2;
    /**
     * Sets a quaternion to represent the shortest rotation from one
     * vector to another.
     *
     * Both vectors are assumed to be unit length.
     *
     * @param {quat} out the receiving quaternion.
     * @param {vec3} a the initial vector
     * @param {vec3} b the destination vector
     * @returns {quat} out
     */

    var rotationTo = function () {
      var tmpvec3 = create$1();
      var xUnitVec3 = fromValues(1, 0, 0);
      var yUnitVec3 = fromValues(0, 1, 0);
      return function (out, a, b) {
        var dot$1 = dot(a, b);

        if (dot$1 < -0.999999) {
          cross(tmpvec3, xUnitVec3, a);
          if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
          normalize$1(tmpvec3, tmpvec3);
          setAxisAngle(out, tmpvec3, Math.PI);
          return out;
        } else if (dot$1 > 0.999999) {
          out[0] = 0;
          out[1] = 0;
          out[2] = 0;
          out[3] = 1;
          return out;
        } else {
          cross(tmpvec3, a, b);
          out[0] = tmpvec3[0];
          out[1] = tmpvec3[1];
          out[2] = tmpvec3[2];
          out[3] = 1 + dot$1;
          return normalize$3(out, out);
        }
      };
    }();
    /**
     * Performs a spherical linear interpolation with two control points
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {quat} c the third operand
     * @param {quat} d the fourth operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     */

    var sqlerp = function () {
      var temp1 = create$4();
      var temp2 = create$4();
      return function (out, a, b, c, d, t) {
        slerp(temp1, a, d, t);
        slerp(temp2, b, c, t);
        slerp(out, temp1, temp2, 2 * t * (1 - t));
        return out;
      };
    }();
    /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     *
     * @param {vec3} view  the vector representing the viewing direction
     * @param {vec3} right the vector representing the local "right" direction
     * @param {vec3} up    the vector representing the local "up" direction
     * @returns {quat} out
     */

    var setAxes = function () {
      var matr = create$2();
      return function (out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];
        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];
        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];
        return normalize$3(out, fromMat3(out, matr));
      };
    }();

    /* node_modules/@sveltejs/gl/scene/Group.svelte generated by Svelte v3.12.1 */

    function create_fragment$1(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target_1, anchor) {
    			if (default_slot) {
    				default_slot.m(target_1, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $target, $$unsubscribe_target = noop, $$subscribe_target = () => ($$unsubscribe_target(), $$unsubscribe_target = subscribe(target, $$value => { $target = $$value; $$invalidate('$target', $target); }), target), $parent_ctm, $ctm;

    	$$self.$$.on_destroy.push(() => $$unsubscribe_target());

    	

    	let { location = [0, 0, 0], lookAt = undefined, up = [0, 1, 0], rotation = [0, 0, 0], scale: scale$1 = 1 } = $$props;

    	const scene = get_scene();
    	const parent = get_parent();

    	const { ctm: parent_ctm } = parent; validate_store(parent_ctm, 'parent_ctm'); component_subscribe($$self, parent_ctm, $$value => { $parent_ctm = $$value; $$invalidate('$parent_ctm', $parent_ctm); });
    	const ctm = writable(null); validate_store(ctm, 'ctm'); component_subscribe($$self, ctm, $$value => { $ctm = $$value; $$invalidate('$ctm', $ctm); });

    	let matrix = create();
    	let quaternion = create$4();
    	const world_position = new Float32Array(matrix.buffer, 12 * 4, 3);

    	set_parent({ ctm });

    	const writable_props = ['location', 'lookAt', 'up', 'rotation', 'scale'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Group> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('scale' in $$props) $$invalidate('scale', scale$1 = $$props.scale);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { location, lookAt, up, rotation, scale: scale$1, matrix, quaternion, scale_array, target, $target, $parent_ctm, $ctm };
    	};

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('scale' in $$props) $$invalidate('scale', scale$1 = $$props.scale);
    		if ('matrix' in $$props) $$invalidate('matrix', matrix = $$props.matrix);
    		if ('quaternion' in $$props) $$invalidate('quaternion', quaternion = $$props.quaternion);
    		if ('scale_array' in $$props) $$invalidate('scale_array', scale_array = $$props.scale_array);
    		if ('target' in $$props) $$subscribe_target($$invalidate('target', target = $$props.target));
    		if ('$target' in $$props) target.set($target);
    		if ('$parent_ctm' in $$props) parent_ctm.set($parent_ctm);
    		if ('$ctm' in $$props) ctm.set($ctm);
    	};

    	let scale_array, target;

    	$$self.$$.update = ($$dirty = { scale: 1, lookAt: 1, $target: 1, matrix: 1, $parent_ctm: 1, location: 1, up: 1, scale_array: 1, quaternion: 1, rotation: 1, $ctm: 1 }) => {
    		if ($$dirty.scale) { $$invalidate('scale_array', scale_array = typeof scale$1 === 'number' ? [scale$1, scale$1, scale$1] : scale$1); }
    		if ($$dirty.lookAt) { $$subscribe_target($$invalidate('target', target = lookAt ? scene.get_target(lookAt) : writable(null))); }
    		if ($$dirty.$target || $$dirty.matrix || $$dirty.$parent_ctm || $$dirty.location || $$dirty.up || $$dirty.scale_array || $$dirty.quaternion || $$dirty.rotation || $$dirty.$ctm) { if ($target) {
    				translate(matrix, $parent_ctm, location);
    				targetTo(matrix, world_position, $target, up);
    				scale(matrix, matrix, scale_array);
    		
    				set_store_value(ctm, $ctm = matrix);
    			} else {
    				$$invalidate('quaternion', quaternion = fromEuler(quaternion || create$4(), ...rotation));
    				$$invalidate('matrix', matrix = fromRotationTranslationScale(matrix, quaternion, location, scale_array));
    				set_store_value(ctm, $ctm = multiply($ctm || create(), $parent_ctm, matrix));
    			} }
    		if ($$dirty.$ctm) { (scene.invalidate()); }
    	};

    	return {
    		location,
    		lookAt,
    		up,
    		rotation,
    		scale: scale$1,
    		parent_ctm,
    		ctm,
    		target,
    		$$slots,
    		$$scope
    	};
    }

    class Group extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["location", "lookAt", "up", "rotation", "scale"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Group", options, id: create_fragment$1.name });
    	}

    	get location() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lookAt() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lookAt(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var vert_builtin = "/* start builtins */\nprecision highp float;\n#define GLSLIFY 1\n\nuniform mat4 MODEL;\nuniform mat4 PROJECTION;\nuniform mat4 VIEW;\nuniform mat4 MODEL_INVERSE_TRANSPOSE;\n\nuniform vec3 CAMERA_WORLD_POSITION;\n\nstruct PointLight {\n\tvec3 location;\n\tvec3 color;\n\tfloat intensity;\n\t// TODO fall-off etc\n};\n\nuniform PointLight POINT_LIGHTS[NUM_LIGHTS];\n/* end builtins *//* end builtins *//* end builtins *//* end builtins */"; // eslint-disable-line

    var frag_builtin = "#extension GL_OES_standard_derivatives : enable\n\n/* start builtins */\nprecision highp float;\n#define GLSLIFY 1\n\nstruct DirectionalLight {\n\tvec3 direction;\n\tvec3 color;\n\tfloat intensity;\n};\n\nstruct PointLight {\n\tvec3 location;\n\tvec3 color;\n\tfloat intensity;\n\t// TODO fall-off etc\n};\n\nuniform vec3 AMBIENT_LIGHT;\nuniform DirectionalLight DIRECTIONAL_LIGHTS[NUM_LIGHTS];\nuniform PointLight POINT_LIGHTS[NUM_LIGHTS];\n/* end builtins *//* end builtins *//* end builtins *//* end builtins */"; // eslint-disable-line

    const caches = new Map();

    const setters = {
    	[5126]:  (gl, loc, data) => gl.uniform1f(loc, data),
    	[35664]: (gl, loc, data) => gl.uniform2fv(loc, data),
    	[35665]: (gl, loc, data) => gl.uniform3fv(loc, data),
    	[35666]: (gl, loc, data) => gl.uniform4fv(loc, data),

    	[35674]: (gl, loc, data) => gl.uniformMatrix2fv(loc, false, data),
    	[35675]: (gl, loc, data) => gl.uniformMatrix3fv(loc, false, data),
    	[35676]: (gl, loc, data) => gl.uniformMatrix4fv(loc, false, data),

    	[35678]: (gl, loc, data) => {
    		gl.activeTexture(gl[`TEXTURE${data.index}`]);
    		gl.bindTexture(gl.TEXTURE_2D, data.texture);
    		gl.uniform1i(loc, data.index);
    	}
    };

    function compile(gl, vert, frag) {
    	if (!caches.has(gl)) caches.set(gl, new Map());
    	const cache = caches.get(gl);

    	const hash = vert + frag;
    	if (!cache.has(hash)) {
    		const program = create_program(gl, vert, frag);
    		const uniforms = get_uniforms(gl, program);
    		const attributes = get_attributes(gl, program);

    		cache.set(hash, { program, uniforms, attributes });
    	}

    	return cache.get(hash);
    }

    function pad(num, len = 4) {
    	num = String(num);
    	while (num.length < len) num = ` ${num}`;
    	return num;
    }

    function repeat(str, i) {
    	let result = '';
    	while (i--) result += str;
    	return result;
    }

    function create_shader(gl, type, source, label) {
    	const shader = gl.createShader(type);
    	gl.shaderSource(shader, source);
    	gl.compileShader(shader);

    	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    		return shader;
    	}

    	const log = gl.getShaderInfoLog(shader);
    	const match = /ERROR: (\d+):(\d+): (.+)/.exec(log);

    	if (match) {
    		const c = +match[1];
    		const l = +match[2] - 1;

    		console.log('%c' + match[3], 'font-weight: bold; color: red');

    		const lines = source.split('\n');
    		for (let i = 0; i < lines.length; i += 1) {
    			if (Math.abs(l - i) > 5) continue;

    			const line = lines[i].replace(/^\t+/gm, tabs => repeat(' ', tabs.length * 4));
    			const indent = /^\s+/.exec(line);

    			const str = `${pad(i)}: ${line}`;

    			if (i === l) {
    				console.log('%c' + str, 'font-weight: bold; color: red');
    				console.log('%c' + (indent && indent[0] || '') + repeat(' ', c + 6) + '^', 'color: red');
    			} else {
    				console.log(str);
    			}
    		}

    		throw new Error(`Failed to compile ${label} shader`);
    	}

    	throw new Error(`Failed to compile ${label} shader:\n${log}`);
    }

    function create_program(gl, vert, frag) {
    	const program = gl.createProgram();

    	gl.attachShader(program, create_shader(gl, gl.VERTEX_SHADER, vert, 'vertex'));
    	gl.attachShader(program, create_shader(gl, gl.FRAGMENT_SHADER, frag, 'fragment'));
    	gl.linkProgram(program);

    	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    	if (!success) {
    		console.log(gl.getProgramInfoLog(program));
    		throw new Error(`Failed to compile program:\n${gl.getProgramInfoLog(program)}`);
    	}

    	return program;
    }

    function get_uniforms(gl, program) {
    	const uniforms = [];

    	const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    	for (let i = 0; i < n; i += 1) {
    		let { size, type, name } = gl.getActiveUniform(program, i);
    		const loc = gl.getUniformLocation(program, name);
    		const setter = setters[type];

    		if (!setter) {
    			throw new Error(`not implemented ${type} (${name})`);
    		}

    		uniforms.push({ size, type, name, setter, loc });
    	}

    	return uniforms;
    }

    function get_attributes(gl, program) {
    	const attributes = [];

    	const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    	for (let i = 0; i < n; i += 1) {
    		let { size, type, name } = gl.getActiveAttrib(program, i);
    		name = name.replace('[0]', '');
    		const loc = gl.getAttribLocation(program, name);

    		attributes.push({ size, type, name, loc });
    	}

    	return attributes;
    }

    function deep_set(obj, path, value) {
    	const parts = path.replace(/\]$/, '').split(/\[|\]\.|\./);

    	while (parts.length > 1) {
    		const part = parts.shift();
    		const next = parts[0];

    		if (!obj[part]) obj[part] = /^\d+$/.test(next) ? [] : {};
    		obj = obj[part];
    	}

    	obj[parts[0]] = value;
    }

    class Material {
    	constructor(scene, vert, frag, defines, blend, depthTest) {
    		this.scene = scene;

    		const gl = scene.gl;
    		this.gl = gl;

    		this.blend = blend;
    		this.depthTest = depthTest;

    		const { program, uniforms, attributes } = compile(
    			gl,
    			scene.defines + defines + '\n\n' + vert_builtin + '\n\n' + vert,
    			scene.defines + defines + '\n\n' + frag_builtin + '\n\n' + frag
    		);

    		this.program = program;
    		this.uniforms = uniforms;
    		this.attributes = attributes;

    		this.uniform_locations = {};
    		this.uniforms.forEach(uniform => {
    			deep_set(this.uniform_locations, uniform.name, gl.getUniformLocation(this.program, uniform.name));
    		});

    		this.attribute_locations = {};
    		this.attributes.forEach(attribute => {
    			this.attribute_locations[attribute.name] = gl.getAttribLocation(this.program, attribute.name);
    		});

    		this.raw_values = {};
    		this.values = {};
    	}

    	set_uniforms(raw_values) {
    		let texture_index = 0;

    		this.uniforms.forEach(({ name, type, loc, setter, processor }) => {
    			if (name in raw_values) {
    				let data = raw_values[name];

    				if (data === this.raw_values[name]) return;

    				if (type === 35678) {
    					// texture
    					this.values[name] = {
    						texture: data.instantiate(this.scene)._,
    						index: texture_index++
    					};

    					return;
    				}

    				if (typeof data === 'number' && type !== 5126) {
    					// data provided was a number like 0x123456,
    					// but it needs to be an array. for now,
    					// assume it's a color, i.e. vec3
    					data = process_color(data);
    				}

    				this.values[name] = data;
    			}
    		});

    		this.raw_values = raw_values;
    	}

    	apply_uniforms(gl, builtins) {
    		// TODO if this is the only program, maybe
    		// we don't need to re-run this each time
    		this.uniforms.forEach(uniform => {
    			if (uniform.name in this.values) {
    				uniform.setter(gl, uniform.loc, this.values[uniform.name]);
    			}
    		});
    	}

    	destroy() {
    		// TODO
    	}
    }

    var vert_default = "#define GLSLIFY 1\nattribute vec3 position;\nattribute vec3 normal;\n\nvarying vec3 v_normal;\n\n#if defined(has_colormap) || defined(has_specularitymap) || defined(has_normalmap) || defined(has_bumpmap)\n#define has_textures true\n#endif\n\n#ifdef has_textures\nattribute vec2 uv;\nvarying vec2 v_uv;\n#endif\n\n#if defined(has_normalmap) || defined(has_bumpmap)\nvarying vec3 v_view_position;\n#endif\n\nvarying vec3 v_surface_to_light[NUM_LIGHTS];\n\n#ifdef has_specularity\nvarying vec3 v_surface_to_view[NUM_LIGHTS];\n#endif\n\n#ifdef USE_FOG\nvarying float v_fog_depth;\n#endif\n\nvoid main() {\n\tvec4 pos = vec4(position, 1.0);\n\tvec4 model_view_pos = VIEW * MODEL * pos;\n\n\tv_normal = (MODEL_INVERSE_TRANSPOSE * vec4(normal, 0.0)).xyz;\n\n\t#ifdef has_textures\n\tv_uv = uv;\n\t#endif\n\n\t#if defined(has_normalmap) || defined(has_bumpmap)\n\tv_view_position = model_view_pos.xyz;\n\t#endif\n\n\t#ifdef USE_FOG\n\tv_fog_depth = -model_view_pos.z;\n\t#endif\n\n\tfor (int i = 0; i < NUM_LIGHTS; i += 1) {\n\t\tPointLight light = POINT_LIGHTS[i];\n\n\t\tvec3 surface_world_position = (MODEL * pos).xyz;\n\t\tv_surface_to_light[i] = light.location - surface_world_position;\n\n\t\t#ifdef has_specularity\n\t\tv_surface_to_view[i] = CAMERA_WORLD_POSITION - surface_world_position;\n\t\t#endif\n\t}\n\n\tgl_Position = PROJECTION * model_view_pos;\n}"; // eslint-disable-line

    var frag_default = "#define GLSLIFY 1\n// mesh uniforms\n#if defined(has_colormap) || defined(has_specularitymap) || defined(has_normalmap) || defined(has_bumpmap) || defined(has_emissivemap)\n#define has_textures true\n#endif\n\n#ifdef has_textures\nvarying vec2 v_uv;\n#endif\n\n#ifdef has_specularity\nuniform float specularity;\n#endif\n\n#ifdef has_colormap\nuniform sampler2D colormap;\n#endif\n\n#ifdef has_emissivemap\nuniform sampler2D emissivemap;\n#endif\n\n#ifdef has_specularitymap\nuniform sampler2D specularitymap;\n#endif\n\n#ifdef has_bumpmap\nuniform sampler2D bumpmap;\n\n// adapted from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/bumpmap_pars_fragment.glsl.js\n// https://github.com/mrdoob/three.js/blob/dev/LICENSE\nvec2 dHdxy_fwd() {\n\tvec2 dSTdx = dFdx(v_uv);\n\tvec2 dSTdy = dFdy(v_uv);\n\n\tfloat Hll = texture2D(bumpmap, v_uv).x;\n\tfloat dBx = texture2D(bumpmap, v_uv + dSTdx).x - Hll;\n\tfloat dBy = texture2D(bumpmap, v_uv + dSTdy).x - Hll;\n\n\t#ifdef has_bumpscale\n\tHll *= bumpscale;\n\tdBx *= bumpscale;\n\tdBy *= bumpscale;\n\t#endif\n\n\treturn vec2(dBx, dBy);\n}\n\nvec3 perturbNormalArb(vec3 surf_pos, vec3 surface_normal, vec2 dHdxy) {\n\t// Workaround for Adreno 3XX dFd*(vec3) bug. See #9988\n\tvec3 vSigmaX = vec3(dFdx(surf_pos.x), dFdx(surf_pos.y), dFdx(surf_pos.z));\n\tvec3 vSigmaY = vec3(dFdy(surf_pos.x), dFdy(surf_pos.y), dFdy(surf_pos.z));\n\tvec3 vN = surface_normal;\n\n\tvec3 R1 = cross(vSigmaY, vN);\n\tvec3 R2 = cross(vN, vSigmaX);\n\n\tfloat fDet = dot(vSigmaX, R1);\n\n\tfDet *= (float(gl_FrontFacing) * 2.0 - 1.0);\n\n\tvec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);\n\treturn normalize(abs(fDet) * surface_normal - vGrad);\n}\n#endif\n\n#ifdef has_bumpscale\nuniform float bumpscale;\n#endif\n\n#ifdef has_normalmap\nuniform sampler2D normalmap;\n\nvec3 perturbNormal2Arb(vec3 eye_pos, vec3 surface_normal) {\n\t// Workaround for Adreno 3XX dFd*(vec3) bug. See https://github.com/mrdoob/three.js/issues/9988\n\tvec3 q0 = vec3(dFdx(eye_pos.x), dFdx(eye_pos.y), dFdx(eye_pos.z));\n\tvec3 q1 = vec3(dFdy(eye_pos.x), dFdy(eye_pos.y), dFdy(eye_pos.z));\n\n\tvec2 st0 = dFdx(v_uv.st);\n\tvec2 st1 = dFdy(v_uv.st);\n\n\t// TODO derivative functions don't seem to work on some\n\t// mobile phones - need to investigate\n\tif (length(q0) == 0.0) {\n\t\treturn surface_normal;\n\t}\n\n\tfloat scale = sign(st1.t * st0.s - st0.t * st1.s); // we do not care about the magnitude\n\n\tvec3 S = normalize((q0 * st1.t - q1 * st0.t) * scale);\n\tvec3 T = normalize((-q0 * st1.s + q1 * st0.s) * scale);\n\tvec3 N = normalize(surface_normal);\n\tmat3 tsn = mat3(S, T, N);\n\tvec3 mapN = texture2D(normalmap, v_uv).xyz * 2.0 - 1.0;\n\n\t// TODO\n\t// mapN.xy *= NORMAL_SCALE;\n\n\tmapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);\n\treturn normalize(tsn * mapN);\n}\n#endif\n\n#ifdef has_color\nuniform vec3 color;\n#endif\n\n#ifdef has_emissive\nuniform vec3 emissive;\n#endif\n\n#ifdef has_alpha\nuniform float alpha;\n#endif\n\n#ifdef USE_FOG\nuniform vec3 FOG_COLOR;\nuniform float FOG_DENSITY;\nvarying float v_fog_depth;\n#endif\n\nvarying vec3 v_normal;\n\n#if defined(has_normalmap) || defined(has_bumpmap)\nvarying vec3 v_view_position;\n#endif\n\nvarying vec3 v_surface_to_light[NUM_LIGHTS];\nvarying vec3 v_surface_to_view[NUM_LIGHTS];\n\nvoid main () {\n\tvec3 normal = normalize(v_normal);\n\n\t#ifdef has_bumpmap\n\t\tnormal = perturbNormalArb(-v_view_position, normal, dHdxy_fwd());\n\t#elif defined(has_normalmap)\n\t\tnormal = perturbNormal2Arb(-v_view_position, normal);\n\t#endif\n\n\tvec3 lighting = vec3(0.0);\n\tvec3 spec_amount = vec3(0.0);\n\n\t// directional lights\n\tfor (int i = 0; i < NUM_LIGHTS; i += 1) {\n\t\tDirectionalLight light = DIRECTIONAL_LIGHTS[i];\n\n\t\tfloat multiplier = clamp(dot(normal, -light.direction), 0.0, 1.0);\n\t\tlighting += multiplier * light.color * light.intensity;\n\t}\n\n\t// point lights\n\tfor (int i = 0; i < NUM_LIGHTS; i += 1) {\n\t\tPointLight light = POINT_LIGHTS[i];\n\n\t\tvec3 surface_to_light = normalize(v_surface_to_light[i]);\n\n\t\tfloat multiplier = clamp(dot(normal, surface_to_light), 0.0, 1.0); // TODO is clamp necessary?\n\t\tlighting += multiplier * light.color * light.intensity;\n\n\t\t#ifdef has_specularity\n\t\t\tvec3 surface_to_view = normalize(v_surface_to_view[i]);\n\t\t\tvec3 half_vector = normalize(surface_to_light + surface_to_view);\n\t\t\tfloat spec = clamp(dot(normal, half_vector), 0.0, 1.0);\n\n\t\t\t#ifdef has_specularitymap\n\t\t\tspec *= texture2D(specularitymap, v_uv).r;\n\t\t\t#endif\n\n\t\t\tspec_amount += specularity * spec * light.color * light.intensity;\n\t\t#endif\n\t}\n\n\t#if defined(has_colormap)\n\tgl_FragColor = texture2D(colormap, v_uv);\n\t#elif defined(has_color)\n\tgl_FragColor = vec4(color, 1.0);\n\t#endif\n\n\t#ifdef has_alpha\n\tgl_FragColor.a *= alpha;\n\t#endif\n\n\tgl_FragColor.rgb *= mix(AMBIENT_LIGHT, vec3(1.0, 1.0, 1.0), lighting);\n\tgl_FragColor.rgb += spec_amount;\n\n\t#if defined(has_emissivemap)\n\tgl_FragColor.rgb += texture2D(emissivemap, v_uv);\n\t#elif defined(has_emissive)\n\tgl_FragColor.rgb += emissive;\n\t#endif\n\n\t#ifdef USE_FOG\n\tgl_FragColor.rgb = mix(\n\t\tgl_FragColor.rgb,\n\t\tFOG_COLOR,\n\t\t1.0 - exp(-FOG_DENSITY * FOG_DENSITY * v_fog_depth * v_fog_depth)\n\t);\n\t#endif\n}"; // eslint-disable-line

    /* node_modules/@sveltejs/gl/scene/Mesh/index.svelte generated by Svelte v3.12.1 */
    const { Object: Object_1 } = globals;

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $ctm;

    	

    	let { location = [0, 0, 0], rotation = [0, 0, 0], scale = 1, geometry, vert = vert_default, frag = frag_default, uniforms = {}, blend = undefined, depthTest = undefined, transparent = false } = $$props;

    	const scene = get_scene();
    	const layer = get_layer();
    	const { ctm } = get_parent(); validate_store(ctm, 'ctm'); component_subscribe($$self, ctm, $$value => { $ctm = $$value; $$invalidate('$ctm', $ctm); });

    	const out = create();
    	const out2 = create();

    	const mesh = {};

    	let existing = true; // track if we've previously added this mesh
    	const add_mesh = () => {
    		layer.add_mesh(mesh, existing);
    		existing = false;
    	};

    	onDestroy(() => {
    		if (mesh.material) mesh.material.destroy();
    	});

    	const writable_props = ['location', 'rotation', 'scale', 'geometry', 'vert', 'frag', 'uniforms', 'blend', 'depthTest', 'transparent'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('geometry' in $$props) $$invalidate('geometry', geometry = $$props.geometry);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    	};

    	$$self.$capture_state = () => {
    		return { location, rotation, scale, geometry, vert, frag, uniforms, blend, depthTest, transparent, existing, scale_array, quaternion, matrix, model, $ctm, defines, material_instance, geometry_instance };
    	};

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('geometry' in $$props) $$invalidate('geometry', geometry = $$props.geometry);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    		if ('existing' in $$props) existing = $$props.existing;
    		if ('scale_array' in $$props) $$invalidate('scale_array', scale_array = $$props.scale_array);
    		if ('quaternion' in $$props) $$invalidate('quaternion', quaternion = $$props.quaternion);
    		if ('matrix' in $$props) $$invalidate('matrix', matrix = $$props.matrix);
    		if ('model' in $$props) $$invalidate('model', model = $$props.model);
    		if ('$ctm' in $$props) ctm.set($ctm);
    		if ('defines' in $$props) $$invalidate('defines', defines = $$props.defines);
    		if ('material_instance' in $$props) $$invalidate('material_instance', material_instance = $$props.material_instance);
    		if ('geometry_instance' in $$props) $$invalidate('geometry_instance', geometry_instance = $$props.geometry_instance);
    	};

    	let scale_array, quaternion, matrix, model, defines, material_instance, geometry_instance;

    	$$self.$$.update = ($$dirty = { scale: 1, quaternion: 1, rotation: 1, matrix: 1, location: 1, scale_array: 1, model: 1, $ctm: 1, uniforms: 1, vert: 1, frag: 1, defines: 1, blend: 1, depthTest: 1, material_instance: 1, geometry: 1, geometry_instance: 1, transparent: 1 }) => {
    		if ($$dirty.scale) { $$invalidate('scale_array', scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale); }
    		if ($$dirty.quaternion || $$dirty.rotation) { $$invalidate('quaternion', quaternion = fromEuler(quaternion || create$4(), ...rotation)); }
    		if ($$dirty.matrix || $$dirty.quaternion || $$dirty.location || $$dirty.scale_array) { $$invalidate('matrix', matrix = fromRotationTranslationScale(matrix || create(), quaternion, location, scale_array)); }
    		if ($$dirty.model || $$dirty.$ctm || $$dirty.matrix) { $$invalidate('model', model = multiply(model || create(), $ctm, matrix)); }
    		if ($$dirty.uniforms) { $$invalidate('defines', defines = Object.keys(uniforms)
    				.filter(k => uniforms[k] != null)
    				.map(k => `#define has_${k} true\n`)
    				.join('')); }
    		if ($$dirty.vert || $$dirty.frag || $$dirty.defines || $$dirty.blend || $$dirty.depthTest) { $$invalidate('material_instance', material_instance = new Material(scene, vert, frag, defines, blend, depthTest)); }
    		if ($$dirty.material_instance || $$dirty.uniforms) { material_instance.set_uniforms(uniforms); }
    		if ($$dirty.geometry || $$dirty.material_instance) { $$invalidate('geometry_instance', geometry_instance = geometry.instantiate(scene.gl, material_instance.program)); }
    		if ($$dirty.model) { mesh.model = model; }
    		if ($$dirty.model) { mesh.model_inverse_transpose = (invert(out2, model), transpose(out2, out2)); }
    		if ($$dirty.material_instance) { mesh.material = material_instance; }
    		if ($$dirty.geometry_instance) { mesh.geometry = geometry_instance; }
    		if ($$dirty.transparent) { mesh.transparent = transparent; }
    		if ($$dirty.transparent) { (add_mesh()); }
    		if ($$dirty.model || $$dirty.transparent) { (transparent && (layer.needs_transparency_sort = true)); }
    		if ($$dirty.geometry_instance || $$dirty.model || $$dirty.uniforms) { (scene.invalidate()); }
    	};

    	return {
    		location,
    		rotation,
    		scale,
    		geometry,
    		vert,
    		frag,
    		uniforms,
    		blend,
    		depthTest,
    		transparent,
    		ctm
    	};
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["location", "rotation", "scale", "geometry", "vert", "frag", "uniforms", "blend", "depthTest", "transparent"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Index", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.geometry === undefined && !('geometry' in props)) {
    			console.warn("<Index> was created without expected prop 'geometry'");
    		}
    	}

    	get location() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get geometry() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set geometry(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vert() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vert(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frag() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frag(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uniforms() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uniforms(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blend() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blend(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depthTest() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depthTest(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transparent() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transparent(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/gl/scene/Target.svelte generated by Svelte v3.12.1 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $ctm;

    	

    	let { id, location = [0, 0, 0] } = $$props;

    	const { get_target } = get_scene();
    	const { ctm } = get_parent(); validate_store(ctm, 'ctm'); component_subscribe($$self, ctm, $$value => { $ctm = $$value; $$invalidate('$ctm', $ctm); });

    	let model = create();
    	const world_position = new Float32Array(model.buffer, 12 * 4, 3);

    	const loc = new Float32Array(3);

    	const writable_props = ['id', 'location'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Target> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    	};

    	$$self.$capture_state = () => {
    		return { id, location, model, x, y, z, $ctm };
    	};

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('model' in $$props) $$invalidate('model', model = $$props.model);
    		if ('x' in $$props) $$invalidate('x', x = $$props.x);
    		if ('y' in $$props) $$invalidate('y', y = $$props.y);
    		if ('z' in $$props) $$invalidate('z', z = $$props.z);
    		if ('$ctm' in $$props) ctm.set($ctm);
    	};

    	let x, y, z;

    	$$self.$$.update = ($$dirty = { location: 1, x: 1, y: 1, z: 1, model: 1, $ctm: 1, loc: 1, id: 1 }) => {
    		if ($$dirty.location) { $$invalidate('x', x = location[0]); }
    		if ($$dirty.location) { $$invalidate('y', y = location[1]); }
    		if ($$dirty.location) { $$invalidate('z', z = location[2]); }
    		if ($$dirty.x || $$dirty.y || $$dirty.z) { $$invalidate('loc', loc[0] = x, loc), $$invalidate('loc', loc[1] = y, loc), $$invalidate('loc', loc[2] = z, loc); }
    		if ($$dirty.model || $$dirty.$ctm || $$dirty.loc) { $$invalidate('model', model = translate(model, $ctm, loc)); }
    		if ($$dirty.model || $$dirty.id) { (get_target(id).set(world_position)); }
    	};

    	return { id, location, ctm };
    }

    class Target extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["id", "location"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Target", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<Target> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Target>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Target>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Target>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Target>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/gl/scene/lights/AmbientLight.svelte generated by Svelte v3.12.1 */

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

    	let { color = [1, 1, 1], intensity = 0.2 } = $$props;

    	const scene = get_scene();

    	const light = {};

    	scene.add_ambient_light(light);

    	const writable_props = ['color', 'intensity'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<AmbientLight> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('intensity' in $$props) $$invalidate('intensity', intensity = $$props.intensity);
    	};

    	$$self.$capture_state = () => {
    		return { color, intensity };
    	};

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('intensity' in $$props) $$invalidate('intensity', intensity = $$props.intensity);
    	};

    	$$self.$$.update = ($$dirty = { color: 1, intensity: 1, light: 1 }) => {
    		if ($$dirty.color) { $$invalidate('light', light.color = process_color(color), light); }
    		if ($$dirty.intensity) { $$invalidate('light', light.intensity = intensity, light); }
    		if ($$dirty.light) { (scene.invalidate()); }
    	};

    	return { color, intensity };
    }

    class AmbientLight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["color", "intensity"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "AmbientLight", options, id: create_fragment$4.name });
    	}

    	get color() {
    		throw new Error("<AmbientLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<AmbientLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intensity() {
    		throw new Error("<AmbientLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intensity(value) {
    		throw new Error("<AmbientLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/gl/scene/lights/DirectionalLight.svelte generated by Svelte v3.12.1 */

    function create_fragment$5(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $ctm;

    	

    	let { direction = new Float32Array([-1, -1, -1]), color = new Float32Array([1, 1, 1]), intensity = 1 } = $$props;

    	const scene = get_scene();
    	const { ctm } = get_parent(); validate_store(ctm, 'ctm'); component_subscribe($$self, ctm, $$value => { $ctm = $$value; $$invalidate('$ctm', $ctm); });

    	const light = {};

    	scene.add_directional_light(light);

    	const writable_props = ['direction', 'color', 'intensity'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<DirectionalLight> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('direction' in $$props) $$invalidate('direction', direction = $$props.direction);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('intensity' in $$props) $$invalidate('intensity', intensity = $$props.intensity);
    	};

    	$$self.$capture_state = () => {
    		return { direction, color, intensity, multiplied, $ctm };
    	};

    	$$self.$inject_state = $$props => {
    		if ('direction' in $$props) $$invalidate('direction', direction = $$props.direction);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('intensity' in $$props) $$invalidate('intensity', intensity = $$props.intensity);
    		if ('multiplied' in $$props) $$invalidate('multiplied', multiplied = $$props.multiplied);
    		if ('$ctm' in $$props) ctm.set($ctm);
    	};

    	let multiplied;

    	$$self.$$.update = ($$dirty = { multiplied: 1, direction: 1, $ctm: 1, light: 1, color: 1, intensity: 1 }) => {
    		if ($$dirty.multiplied || $$dirty.direction || $$dirty.$ctm) { $$invalidate('multiplied', multiplied = transformMat4(multiplied || create$1(), direction, $ctm)); }
    		if ($$dirty.light || $$dirty.multiplied) { $$invalidate('light', light.direction = normalize$1(light.direction || create$1(), multiplied), light); }
    		if ($$dirty.color) { $$invalidate('light', light.color = process_color(color), light); }
    		if ($$dirty.intensity) { $$invalidate('light', light.intensity = intensity, light); }
    		if ($$dirty.light) { (scene.invalidate()); }
    	};

    	return { direction, color, intensity, ctm };
    }

    class DirectionalLight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["direction", "color", "intensity"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "DirectionalLight", options, id: create_fragment$5.name });
    	}

    	get direction() {
    		throw new Error("<DirectionalLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<DirectionalLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<DirectionalLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<DirectionalLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intensity() {
    		throw new Error("<DirectionalLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intensity(value) {
    		throw new Error("<DirectionalLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/gl/scene/lights/PointLight.svelte generated by Svelte v3.12.1 */

    function create_fragment$6(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $ctm;

    	

    	let { location = new Float32Array([-1, -1, -1]), color = new Float32Array([1, 1, 1]), intensity = 1 } = $$props;

    	const scene = get_scene();
    	const { ctm } = get_parent(); validate_store(ctm, 'ctm'); component_subscribe($$self, ctm, $$value => { $ctm = $$value; $$invalidate('$ctm', $ctm); });

    	let light = { // TODO change to a const once bug is fixed
    		location: create$1(),
    		color: null,
    		intensity: null
    	};

    	scene.add_point_light(light);

    	const writable_props = ['location', 'color', 'intensity'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PointLight> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('intensity' in $$props) $$invalidate('intensity', intensity = $$props.intensity);
    	};

    	$$self.$capture_state = () => {
    		return { location, color, intensity, light, $ctm };
    	};

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('intensity' in $$props) $$invalidate('intensity', intensity = $$props.intensity);
    		if ('light' in $$props) $$invalidate('light', light = $$props.light);
    		if ('$ctm' in $$props) ctm.set($ctm);
    	};

    	$$self.$$.update = ($$dirty = { light: 1, location: 1, $ctm: 1, color: 1, intensity: 1 }) => {
    		if ($$dirty.light || $$dirty.location || $$dirty.$ctm) { $$invalidate('light', light.location = transformMat4(light.location, location, $ctm), light); }
    		if ($$dirty.color) { $$invalidate('light', light.color = process_color(color), light); }
    		if ($$dirty.intensity) { $$invalidate('light', light.intensity = intensity, light); }
    		if ($$dirty.light) { (scene.invalidate()); }
    	};

    	return { location, color, intensity, ctm };
    }

    class PointLight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["location", "color", "intensity"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "PointLight", options, id: create_fragment$6.name });
    	}

    	get location() {
    		throw new Error("<PointLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<PointLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<PointLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<PointLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intensity() {
    		throw new Error("<PointLight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intensity(value) {
    		throw new Error("<PointLight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function clamp(num, min, max) {
        return num < min ? min : num > max ? max : num;
    }

    function debounce(fn) {
    	let scheduled = false;
    	let event;

    	function release() {
    		fn(event);
    		scheduled = false;
    	}

    	return function(e) {
    		if (!scheduled) {
    			requestAnimationFrame(release);
    			scheduled = true;
    		}

    		event = e;
    	};
    }

    /* node_modules/@sveltejs/gl/controls/OrbitControls.svelte generated by Svelte v3.12.1 */

    const get_default_slot_changes$1 = ({ location, target }) => ({ location: location, target: target });
    const get_default_slot_context$1 = ({ location, target }) => ({
    	location: location,
    	target: target
    });

    function create_fragment$7(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target_1, anchor) {
    			if (default_slot) {
    				default_slot.m(target_1, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.location || changed.target)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes$1),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context$1)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    const EPSILON$1 = 0.000001;

    function pythag(a, b) {
    	return Math.sqrt(a * a + b * b);
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

    	// TODO check we're not inside a group?
    	const scene = get_scene();

    	let { location = new Float32Array([1, 3, 5]), target = new Float32Array([0, 1, 0]), up = new Float32Array([0, 1, 0]), minDistance = 0, maxDistance = Infinity, minPolarAngle = 0, maxPolarAngle = Math.PI, minAzimuthAngle = - Infinity, maxAzimuthAngle = Infinity, damping = false } = $$props;

    	function rotate(x, y) {
    		// TODO handle the up vector. for now, just assume [0,1,0]
    		const vx = location[0] - target[0];
    		const vy = location[1] - target[1];
    		const vz = location[2] - target[2];

    		const radius = Math.sqrt(vx * vx + vy * vy + vz * vz);

    		let theta = Math.atan2(vx, vz);
    		theta -= x;

    		let phi = Math.acos(clamp(vy / radius, -1, 1));
    		phi = clamp(phi - y, EPSILON$1, Math.PI - EPSILON$1);
    		phi = clamp(phi, minPolarAngle, maxPolarAngle);

    		const sin_phi_radius = Math.sin(phi) * radius;

    		const nx = sin_phi_radius * Math.sin(theta);
    		const ny = Math.cos(phi) * radius;
    		const nz = sin_phi_radius * Math.cos(theta);

    		$$invalidate('location', location[0] = target[0] + nx, location);
    		$$invalidate('location', location[1] = target[1] + ny, location);
    		$$invalidate('location', location[2] = target[2] + nz, location);
    	}

    	function pan(dx, dy) {
    		// TODO handle the up vector. for now, just assume [0,1,0]
    		const vx = location[0] - target[0];
    		const vy = location[1] - target[1];
    		const vz = location[2] - target[2];

    		// delta y = along xz
    		{
    			const direction = normalize([vx, vz]);
    			const x = -direction[0] * dy;
    			const z = -direction[1] * dy;

    			$$invalidate('location', location[0] += x, location);
    			$$invalidate('location', location[2] += z, location);

    			$$invalidate('target', target[0] += x, target);
    			$$invalidate('target', target[2] += z, target);
    		}

    		// delta x = tangent to xz
    		{
    			const tangent = normalize([-vz, vx]);
    			const x = tangent[0] * dx;
    			const z = tangent[1] * dx;

    			$$invalidate('location', location[0] += x, location);
    			$$invalidate('location', location[2] += z, location);

    			$$invalidate('target', target[0] += x, target);
    			$$invalidate('target', target[2] += z, target);
    		}
    	}

    	function zoom(amount) {
    		let vx = location[0] - target[0];
    		let vy = location[1] - target[1];
    		let vz = location[2] - target[2];

    		const mag = Math.sqrt(vx * vx + vy * vy + vz * vz);

    		amount = clamp(
    			amount,
    			(mag / maxDistance),
    			minDistance ? (mag / minDistance) : Infinity
    		);

    		vx /= amount;
    		vy /= amount;
    		vz /= amount;

    		$$invalidate('location', location[0] = target[0] + vx, location);
    		$$invalidate('location', location[1] = target[1] + vy, location);
    		$$invalidate('location', location[2] = target[2] + vz, location);
    	}

    	function handle_mousedown(event) {
    		let last_x = event.clientX;
    		let last_y = event.clientY;

    		const handle_mousemove = debounce(event => {
    			const x = event.clientX;
    			const y = event.clientY;

    			const dx = x - last_x;
    			const dy = y - last_y;

    			if (event.shiftKey || event.which === 2) {
    				pan(dx * 0.01, dy * 0.01);
    			} else {
    				rotate(dx * 0.005, dy * 0.005);
    			}

    			last_x = x;
    			last_y = y;
    		});

    		function handle_mouseup(event) {
    			window.removeEventListener('mousemove', handle_mousemove);
    			window.removeEventListener('mouseup', handle_mouseup);
    		}

    		window.addEventListener('mousemove', handle_mousemove);
    		window.addEventListener('mouseup', handle_mouseup);
    	}

    	const mousewheel_zoom = debounce(event => {
    		zoom(Math.pow(1.004, event.wheelDeltaY));
    	});

    	function handle_mousewheel(event) {
    		event.preventDefault();
    		mousewheel_zoom(event);
    	}

    	function start_rotate(event) {
    		event.preventDefault();

    		const touch = event.touches[0];
    		const finger = touch.identifier;

    		let last_x = touch.clientX;
    		let last_y = touch.clientY;

    		const handle_touchmove = debounce(event => {
    			if (event.touches.length > 1) return;

    			const touch = event.touches[0];
    			if (touch.identifier !== finger) return;

    			const dx = (touch.clientX - last_x);
    			const dy = (touch.clientY - last_y);

    			rotate(dx * 0.003, dy * 0.003);

    			last_x = touch.clientX;
    			last_y = touch.clientY;		});

    		function handle_touchend(event) {
    			let i = event.changedTouches.length;

    			while (i--) {
    				const touch = event.changedTouches[i];
    				if (touch.identifier === finger) {
    					window.removeEventListener('touchmove', handle_touchmove);
    					window.removeEventListener('touchend', handle_touchend);

    					return;
    				}
    			}
    		}

    		window.addEventListener('touchmove', handle_touchmove);
    		window.addEventListener('touchend', handle_touchend);
    	}

    	function start_pan_zoom(event) {
    		event.preventDefault();

    		const touch_a = event.touches[0];
    		const touch_b = event.touches[1];

    		const finger_a = touch_a.identifier;
    		const finger_b = touch_b.identifier;

    		let last_cx = (touch_a.clientX + touch_b.clientX) / 2;
    		let last_cy = (touch_a.clientY + touch_b.clientY) / 2;
    		let last_d = pythag(touch_b.clientX - touch_a.clientX, touch_b.clientY - touch_a.clientY);

    		const handle_touchmove = debounce(event => {
    			if (event.touches.length !== 2) {
    				alert(`${event.touches.length} touches`);
    				return;
    			}

    			const touch_a = event.touches[0];
    			const touch_b = event.touches[1];

    			if (touch_a.identifier !== finger_a && touch_a.identifier !== finger_b) return;
    			if (touch_b.identifier !== finger_a && touch_b.identifier !== finger_b) return;

    			const cx = (touch_a.clientX + touch_b.clientX) / 2;
    			const cy = (touch_a.clientY + touch_b.clientY) / 2;
    			const d = pythag(touch_b.clientX - touch_a.clientX, touch_b.clientY - touch_a.clientY);

    			const dx = cx - last_cx;
    			const dy = cy - last_cy;

    			pan(dx * 0.01, dy * 0.01);
    			zoom(d / last_d);

    			last_cx = cx;
    			last_cy = cy;
    			last_d = d;
    		});

    		function handle_touchend(event) {
    			let i = event.changedTouches.length;

    			while (i--) {
    				const touch = event.changedTouches[i];
    				if (touch.identifier === finger_a || touch.identifier === finger_b) {
    					window.removeEventListener('touchmove', handle_touchmove);
    					window.removeEventListener('touchend', handle_touchend);

    					return;
    				}
    			}
    		}

    		window.addEventListener('touchmove', handle_touchmove);
    		window.addEventListener('touchend', handle_touchend);
    	}

    	function handle_touchstart(event) {
    		if (event.touches.length === 1) {
    			start_rotate(event);
    		}

    		if (event.touches.length === 2) {
    			start_pan_zoom(event);
    		}
    	}

    	scene.canvas.addEventListener('mousedown', handle_mousedown);
    	scene.canvas.addEventListener('mousewheel', handle_mousewheel);
    	scene.canvas.addEventListener('touchstart', handle_touchstart);

    	onDestroy(() => {
    		scene.canvas.removeEventListener('mousedown', handle_mousedown);
    		scene.canvas.removeEventListener('mousewheel', handle_mousewheel);
    		scene.canvas.removeEventListener('touchstart', handle_touchstart);
    	});

    	const writable_props = ['location', 'target', 'up', 'minDistance', 'maxDistance', 'minPolarAngle', 'maxPolarAngle', 'minAzimuthAngle', 'maxAzimuthAngle', 'damping'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<OrbitControls> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('target' in $$props) $$invalidate('target', target = $$props.target);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('minDistance' in $$props) $$invalidate('minDistance', minDistance = $$props.minDistance);
    		if ('maxDistance' in $$props) $$invalidate('maxDistance', maxDistance = $$props.maxDistance);
    		if ('minPolarAngle' in $$props) $$invalidate('minPolarAngle', minPolarAngle = $$props.minPolarAngle);
    		if ('maxPolarAngle' in $$props) $$invalidate('maxPolarAngle', maxPolarAngle = $$props.maxPolarAngle);
    		if ('minAzimuthAngle' in $$props) $$invalidate('minAzimuthAngle', minAzimuthAngle = $$props.minAzimuthAngle);
    		if ('maxAzimuthAngle' in $$props) $$invalidate('maxAzimuthAngle', maxAzimuthAngle = $$props.maxAzimuthAngle);
    		if ('damping' in $$props) $$invalidate('damping', damping = $$props.damping);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { location, target, up, minDistance, maxDistance, minPolarAngle, maxPolarAngle, minAzimuthAngle, maxAzimuthAngle, damping };
    	};

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('target' in $$props) $$invalidate('target', target = $$props.target);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('minDistance' in $$props) $$invalidate('minDistance', minDistance = $$props.minDistance);
    		if ('maxDistance' in $$props) $$invalidate('maxDistance', maxDistance = $$props.maxDistance);
    		if ('minPolarAngle' in $$props) $$invalidate('minPolarAngle', minPolarAngle = $$props.minPolarAngle);
    		if ('maxPolarAngle' in $$props) $$invalidate('maxPolarAngle', maxPolarAngle = $$props.maxPolarAngle);
    		if ('minAzimuthAngle' in $$props) $$invalidate('minAzimuthAngle', minAzimuthAngle = $$props.minAzimuthAngle);
    		if ('maxAzimuthAngle' in $$props) $$invalidate('maxAzimuthAngle', maxAzimuthAngle = $$props.maxAzimuthAngle);
    		if ('damping' in $$props) $$invalidate('damping', damping = $$props.damping);
    	};

    	return {
    		location,
    		target,
    		up,
    		minDistance,
    		maxDistance,
    		minPolarAngle,
    		maxPolarAngle,
    		minAzimuthAngle,
    		maxAzimuthAngle,
    		damping,
    		$$slots,
    		$$scope
    	};
    }

    class OrbitControls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["location", "target", "up", "minDistance", "maxDistance", "minPolarAngle", "maxPolarAngle", "minAzimuthAngle", "maxAzimuthAngle", "damping"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "OrbitControls", options, id: create_fragment$7.name });
    	}

    	get location() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minDistance() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minDistance(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxDistance() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxDistance(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minPolarAngle() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minPolarAngle(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxPolarAngle() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxPolarAngle(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minAzimuthAngle() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minAzimuthAngle(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxAzimuthAngle() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxAzimuthAngle(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get damping() {
    		throw new Error("<OrbitControls>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set damping(value) {
    		throw new Error("<OrbitControls>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/gl/scene/cameras/PerspectiveCamera.svelte generated by Svelte v3.12.1 */

    function create_fragment$8(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $ctm, $target, $$unsubscribe_target = noop, $$subscribe_target = () => ($$unsubscribe_target(), $$unsubscribe_target = subscribe(target, $$value => { $target = $$value; $$invalidate('$target', $target); }), target), $width, $height;

    	$$self.$$.on_destroy.push(() => $$unsubscribe_target());

    	

    	let { location = [0, 0, 0], rotation = [0, 0, 0], lookAt = null, up = [0, 1, 0], fov = 60, near = 1, far = 20000 } = $$props;

    	const { add_camera, update_camera, width, height, get_target } = get_scene(); validate_store(width, 'width'); component_subscribe($$self, width, $$value => { $width = $$value; $$invalidate('$width', $width); }); validate_store(height, 'height'); component_subscribe($$self, height, $$value => { $height = $$value; $$invalidate('$height', $height); });
    	const { ctm } = get_parent(); validate_store(ctm, 'ctm'); component_subscribe($$self, ctm, $$value => { $ctm = $$value; $$invalidate('$ctm', $ctm); });

    	const matrix = create();
    	const world_position = new Float32Array(matrix.buffer, 12 * 4, 3);

    	// should be a const, pending https://github.com/sveltejs/svelte/issues/2728
    	let camera = {
    		matrix,
    		world_position,
    		view: create(),
    		projection: create()
    	};

    	let target = writable(null); $$subscribe_target();

    	add_camera(camera);

    	const writable_props = ['location', 'rotation', 'lookAt', 'up', 'fov', 'near', 'far'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PerspectiveCamera> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('fov' in $$props) $$invalidate('fov', fov = $$props.fov);
    		if ('near' in $$props) $$invalidate('near', near = $$props.near);
    		if ('far' in $$props) $$invalidate('far', far = $$props.far);
    	};

    	$$self.$capture_state = () => {
    		return { location, rotation, lookAt, up, fov, near, far, camera, target, $ctm, $target, $width, $height };
    	};

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('fov' in $$props) $$invalidate('fov', fov = $$props.fov);
    		if ('near' in $$props) $$invalidate('near', near = $$props.near);
    		if ('far' in $$props) $$invalidate('far', far = $$props.far);
    		if ('camera' in $$props) $$invalidate('camera', camera = $$props.camera);
    		if ('target' in $$props) $$subscribe_target($$invalidate('target', target = $$props.target));
    		if ('$ctm' in $$props) ctm.set($ctm);
    		if ('$target' in $$props) target.set($target);
    		if ('$width' in $$props) width.set($width);
    		if ('$height' in $$props) height.set($height);
    	};

    	$$self.$$.update = ($$dirty = { lookAt: 1, target: 1, camera: 1, $ctm: 1, location: 1, $target: 1, up: 1, fov: 1, $width: 1, $height: 1, near: 1, far: 1 }) => {
    		if ($$dirty.lookAt || $$dirty.target) { if (typeof lookAt === 'string') {
    				$$subscribe_target($$invalidate('target', target = get_target(lookAt)));
    			} else {
    				target.set(lookAt);
    			} }
    		if ($$dirty.camera || $$dirty.$ctm || $$dirty.location || $$dirty.$target || $$dirty.up) { $$invalidate('camera', camera.matrix = (
    				translate(camera.matrix, $ctm, location),
    				$target && targetTo(camera.matrix, world_position, $target, up),
    				camera.matrix
    			), camera); }
    		if ($$dirty.camera) { $$invalidate('camera', camera.view = invert(camera.view, camera.matrix), camera); }
    		if ($$dirty.camera || $$dirty.fov || $$dirty.$width || $$dirty.$height || $$dirty.near || $$dirty.far) { $$invalidate('camera', camera.projection = perspective(
    				camera.projection,
    				fov / 180 * Math.PI,
    				$width / $height,
    				near,
    				far
    			), camera); }
    		if ($$dirty.camera) { update_camera(camera); }
    	};

    	return {
    		location,
    		rotation,
    		lookAt,
    		up,
    		fov,
    		near,
    		far,
    		width,
    		height,
    		ctm,
    		target
    	};
    }

    class PerspectiveCamera extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["location", "rotation", "lookAt", "up", "fov", "near", "far"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "PerspectiveCamera", options, id: create_fragment$8.name });
    	}

    	get location() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lookAt() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lookAt(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fov() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fov(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get near() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set near(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get far() {
    		throw new Error("<PerspectiveCamera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set far(value) {
    		throw new Error("<PerspectiveCamera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class GeometryInstance {
    	constructor(gl, program, attributes, index, primitive, count) {
    		this.attributes = attributes;
    		this.index = index;
    		this.primitive = primitive;
    		this.count = count;

    		this.locations = {};
    		this.buffers = {};

    		for (const key in attributes) {
    			const attribute = attributes[key];

    			this.locations[key] = gl.getAttribLocation(program, key);

    			const buffer = gl.createBuffer();
    			this.buffers[key] = buffer;

    			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    			gl.bufferData(gl.ARRAY_BUFFER, attribute.data, attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    		}

    		if (index) {
    			const buffer = gl.createBuffer();
    			this.buffers.__index = buffer;
    			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
    		}
    	}

    	set_attributes(gl) {
    		for (const key in this.attributes) {
    			const attribute = this.attributes[key];

    			const loc = this.locations[key];
    			if (loc < 0) continue; // attribute is unused by current program

    			const {
    				size = 3,
    				type = gl.FLOAT,
    				normalized = false,
    				stride = 0,
    				offset = 0
    			} = attribute;

    			// Bind the position buffer.
    			const buffer = this.buffers[key];

    			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    			// Turn on the attribute
    			gl.enableVertexAttribArray(loc);

    			gl.vertexAttribPointer(
    				loc,
    				size,
    				type,
    				normalized,
    				stride,
    				offset
    			);
    		}
    	}
    }

    class Geometry {
    	constructor(attributes = {}, opts = {}) {
    		this.attributes = attributes;

    		const { index, primitive = 'TRIANGLES' } = opts;
    		this.index = index;
    		this.primitive = primitive.toUpperCase();

    		this.count = Infinity;
    		for (const k in attributes) {
    			const count = attributes[k].data.length / attributes[k].size;
    			if (count < this.count) this.count = count;
    		}

    		if (this.count === Infinity) {
    			throw new Error(`GL.Geometry must be instantiated with one or more { data, size } attributes`);
    		}

    		this.instances = new Map();
    	}

    	instantiate(gl, program) {
    		if (!this.instances.has(program)) {
    			this.instances.set(program, new GeometryInstance(
    				gl,
    				program,
    				this.attributes,
    				this.index,
    				this.primitive,
    				this.count
    			));
    		}

    		return this.instances.get(program);
    	}
    }

    var plane = memoize(() => {
    	return new Geometry({
    		position: {
    			data: new Float32Array([
    				 1,  1, 0,
    				-1,  1, 0,
    				 1, -1, 0,
    				-1, -1, 0,
    			]),
    			size: 3
    		},

    		normal: {
    			data: new Float32Array([
    				0, 0, 1,
    				0, 0, 1,
    				0, 0, 1,
    				0, 0, 1
    			]),
    			size: 3
    		},

    		uv: {
    			data: new Float32Array([
    				1, 0,
    				0, 0,
    				1, 1,
    				0, 1
    			]),
    			size: 2
    		}
    	}, {
    		index: new Uint32Array([
    			0, 1, 2,
    			3, 2, 1
    		])
    	});
    });

    const p = 0.85065080835204;
    const q = 0.5257311121191336;

    const position = new Float32Array([
    	-q, +p,  0,
    	+q, +p,  0,
    	-q, -p,  0,
    	+q, -p,  0,
    	 0, -q, +p,
    	 0, +q, +p,
    	 0, -q, -p,
    	 0, +q, -p,
    	+p,  0, -q,
    	+p,  0, +q,
    	-p,  0, -q,
    	-p,  0, +q
    ]);

    const index = new Uint16Array([
    	0, 11, 5,
    	0, 5, 1,
    	0, 1, 7,
    	0, 7, 10,
    	0, 10, 11,
    	1, 5, 9,
    	5, 11, 4,
    	11, 10, 2,
    	10, 7, 6,
    	7, 1, 8,
    	3, 9, 4,
    	3, 4, 2,
    	3, 2, 6,
    	3, 6, 8,
    	3, 8, 9,
    	4, 9, 5,
    	2, 4, 11,
    	6, 2, 10,
    	8, 6, 7,
    	9, 8, 1
    ]);

    const smooth_geometry = [
    	new Geometry({
    		position: { data: position, size: 3 },
    		normal: { data: position, size: 3 }
    	}, { index })
    ];

    const PI = Math.PI;
    const PI2 = PI * 2;

    function create_smooth_geometry(turns, bands, turns_chord, bands_chord) {
    	const num_vertices = (turns + 1) * (bands + 1);
    	const num_faces_per_turn = 2 * bands;
    	const num_faces = num_faces_per_turn * turns;

    	const position = new Float32Array(num_vertices * 3); // doubles as normal
    	const uv = new Float32Array(num_vertices * 2);
    	const index = new Uint32Array(num_faces * 3);

    	let position_index = 0;
    	let uv_index = 0;

    	for (let i = 0; i <= turns; i += 1) {
    		const u = i / turns * turns_chord;

    		for (let j = 0; j <= bands; j += 1) {
    			const v = j / bands * bands_chord;

    			const x = -Math.cos(u * PI2) * Math.sin(v * PI);
    			const y = Math.cos(v * PI);
    			const z = Math.sin(u * PI2) * Math.sin(v * PI);

    			position[position_index++] = x;
    			position[position_index++] = y;
    			position[position_index++] = z;

    			uv[uv_index++] = u;
    			uv[uv_index++] = v;
    		}
    	}

    	let face_index = 0;

    	for (let i = 0; i < turns; i += 1) {
    		const offset = i * (bands + 1);

    		// north pole face
    		index[face_index++] = offset + 0;
    		index[face_index++] = offset + 1;
    		index[face_index++] = offset + bands + 2;

    		for (let j = 1; j < bands; j += 1) {
    			index[face_index++] = offset + j;
    			index[face_index++] = offset + j + 1;
    			index[face_index++] = offset + j + bands + 1;

    			index[face_index++] = offset + j + bands + 1;
    			index[face_index++] = offset + j + 1;
    			index[face_index++] = offset + j + bands + 2;
    		}

    		index[face_index++] = offset + bands - 1;
    		index[face_index++] = offset + bands;
    		index[face_index++] = offset + bands * 2;
    	}

    	return new Geometry({
    		position: {
    			data: position,
    			size: 3
    		},
    		normal: {
    			data: position,
    			size: 3
    		},
    		uv: {
    			data: uv,
    			size: 2
    		}
    	}, {
    		index
    	});
    }

    function create_flat_geometry(turns, bands, turns_chord, bands_chord) {
    	throw new Error('TODO implement flat geometry');
    }

    var sphere = memoize(({ turns = 8, bands = 6, turns_chord = 1, bands_chord = 1, shading = 'smooth' } = {}) => {
    	return shading === 'smooth'
    		? create_smooth_geometry(turns, bands, turns_chord, bands_chord)
    		: create_flat_geometry();
    });

    const PI$1 = Math.PI;
    const PI2$1 = PI$1 * 2;

    function create_smooth_geometry$1(turns, turns_chord) {
    	const num_vertices = (turns + 1) * (1 + 1);
    	const num_faces_per_turn = 2 * 1;
    	const num_faces = num_faces_per_turn * turns;

    	const position = new Float32Array(num_vertices * 3); // doubles as normal
    	const uv = new Float32Array(num_vertices * 2);
    	const index = new Uint32Array(num_faces * 3);

    	let position_index = 0;
    	let uv_index = 0;

    	for (let i = 0; i <= turns; i += 1) {
    		const u = i / turns * turns_chord;

    		for (let v = 0; v <= 1; v += 1) {
    			const x = -Math.cos(u * PI2$1);
    			const y = 0.5 - v;
    			const z = Math.sin(u * PI2$1);

    			position[position_index++] = x;
    			position[position_index++] = y;
    			position[position_index++] = z;

    			uv[uv_index++] = u;
    			uv[uv_index++] = v;
    		}
    	}

    	let face_index = 0;

    	for (let i = 0; i < turns; i += 1) {
    		const offset = i * 2;

    		index[face_index++] = offset + 0; // top
    		index[face_index++] = offset + 1; // bottom
    		index[face_index++] = offset + 3; // next bottom

    		index[face_index++] = offset + 0; // top
    		index[face_index++] = offset + 3; // next bottom
    		index[face_index++] = offset + 2; // next top
    	}

    	return new Geometry({
    		position: {
    			data: position,
    			size: 3
    		},
    		normal: {
    			data: position,
    			size: 3
    		},
    		uv: {
    			data: uv,
    			size: 2
    		}
    	}, {
    		index
    	});
    }

    function create_flat_geometry$1(turns, turns_chord) {
    	throw new Error('TODO implement flat geometry');
    }

    var cylinder = memoize(({ turns = 8, turns_chord = 1, shading = 'smooth' } = {}) => {
    	return shading === 'smooth'
    		? create_smooth_geometry$1(turns, turns_chord)
    		: create_flat_geometry$1();
    });

    const worker_url = (typeof Blob !== 'undefined' && URL.createObjectURL(new Blob(
    	[`self.onmessage = e => { self.onmessage = null; eval(e.data); };`],
    	{ type: 'application/javascript' }
    ))) || typeof window !== 'undefined' && window.SVELTE_GL_WORKER_URL;

    /* src/CubeFace.svelte generated by Svelte v3.12.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.corner = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.edge = list[i];
    	return child_ctx;
    }

    // (69:2) {#each edges as edge}
    function create_each_block_1(ctx) {
    	var current;

    	var gl_mesh = new Index({
    		props: {
    		geometry: cylinder({ turns: 26, turns_chord: 0.25 }),
    		location: ctx.edge.location,
    		rotation: ctx.edge.rotation,
    		scale: ctx.edge.scale,
    		vert: ctx.vert,
    		frag: ctx.frag,
    		uniforms: ctx.uniforms,
    		blend: ctx.blend,
    		depthTest: ctx.depthTest,
    		transparent: ctx.transparent
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_mesh.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_mesh, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_mesh_changes = {};
    			if (changed.edges) gl_mesh_changes.location = ctx.edge.location;
    			if (changed.edges) gl_mesh_changes.rotation = ctx.edge.rotation;
    			if (changed.edges) gl_mesh_changes.scale = ctx.edge.scale;
    			if (changed.vert) gl_mesh_changes.vert = ctx.vert;
    			if (changed.frag) gl_mesh_changes.frag = ctx.frag;
    			if (changed.uniforms) gl_mesh_changes.uniforms = ctx.uniforms;
    			if (changed.blend) gl_mesh_changes.blend = ctx.blend;
    			if (changed.depthTest) gl_mesh_changes.depthTest = ctx.depthTest;
    			if (changed.transparent) gl_mesh_changes.transparent = ctx.transparent;
    			gl_mesh.$set(gl_mesh_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_mesh.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_mesh.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_mesh, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(69:2) {#each edges as edge}", ctx });
    	return block;
    }

    // (85:2) {#each cube_corners as corner}
    function create_each_block(ctx) {
    	var current;

    	var gl_mesh = new Index({
    		props: {
    		geometry: sphere({ turns: 26, bands: 26, turns_chord: 0.25, bands_chord: 0.5 }),
    		location: ctx.corner.location,
    		rotation: ctx.corner.rotation,
    		scale: ctx.radius,
    		vert: ctx.vert,
    		frag: ctx.frag,
    		uniforms: ctx.uniforms,
    		blend: ctx.blend,
    		depthTest: ctx.depthTest,
    		transparent: ctx.transparent
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_mesh.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_mesh, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_mesh_changes = {};
    			if (changed.cube_corners) gl_mesh_changes.location = ctx.corner.location;
    			if (changed.cube_corners) gl_mesh_changes.rotation = ctx.corner.rotation;
    			if (changed.radius) gl_mesh_changes.scale = ctx.radius;
    			if (changed.vert) gl_mesh_changes.vert = ctx.vert;
    			if (changed.frag) gl_mesh_changes.frag = ctx.frag;
    			if (changed.uniforms) gl_mesh_changes.uniforms = ctx.uniforms;
    			if (changed.blend) gl_mesh_changes.blend = ctx.blend;
    			if (changed.depthTest) gl_mesh_changes.depthTest = ctx.depthTest;
    			if (changed.transparent) gl_mesh_changes.transparent = ctx.transparent;
    			gl_mesh.$set(gl_mesh_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_mesh.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_mesh.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_mesh, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(85:2) {#each cube_corners as corner}", ctx });
    	return block;
    }

    // (62:0) <GL.Group   location={location}   lookAt={lookAt}   up={up}   rotation={rotation} >
    function create_default_slot(ctx) {
    	var t0, t1, current;

    	let each_value_1 = ctx.edges;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = ctx.cube_corners;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	var gl_mesh = new Index({
    		props: {
    		geometry: plane(),
    		location: [0,0,0],
    		rotation: [0,0,0],
    		scale: [ctx.w * 0.5 - ctx.radius, ctx.h * 0.5 - ctx.radius, 1],
    		vert: ctx.vert,
    		frag: ctx.frag,
    		uniforms: ctx.uniforms,
    		blend: ctx.blend,
    		depthTest: ctx.depthTest,
    		transparent: ctx.transparent
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			gl_mesh.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(gl_mesh, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.GL || changed.edges || changed.vert || changed.frag || changed.uniforms || changed.blend || changed.depthTest || changed.transparent) {
    				each_value_1 = ctx.edges;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(t0.parentNode, t0);
    					}
    				}

    				group_outros();
    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (changed.GL || changed.cube_corners || changed.radius || changed.vert || changed.frag || changed.uniforms || changed.blend || changed.depthTest || changed.transparent) {
    				each_value = ctx.cube_corners;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t1.parentNode, t1);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}
    				check_outros();
    			}

    			var gl_mesh_changes = {};
    			if (changed.w || changed.radius || changed.h) gl_mesh_changes.scale = [ctx.w * 0.5 - ctx.radius, ctx.h * 0.5 - ctx.radius, 1];
    			if (changed.vert) gl_mesh_changes.vert = ctx.vert;
    			if (changed.frag) gl_mesh_changes.frag = ctx.frag;
    			if (changed.uniforms) gl_mesh_changes.uniforms = ctx.uniforms;
    			if (changed.blend) gl_mesh_changes.blend = ctx.blend;
    			if (changed.depthTest) gl_mesh_changes.depthTest = ctx.depthTest;
    			if (changed.transparent) gl_mesh_changes.transparent = ctx.transparent;
    			gl_mesh.$set(gl_mesh_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(gl_mesh.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(gl_mesh.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks_1, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(gl_mesh, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(62:0) <GL.Group   location={location}   lookAt={lookAt}   up={up}   rotation={rotation} >", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var current;

    	var gl_group = new Group({
    		props: {
    		location: ctx.location,
    		lookAt: ctx.lookAt,
    		up: ctx.up,
    		rotation: ctx.rotation,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_group.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_group, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_group_changes = {};
    			if (changed.location) gl_group_changes.location = ctx.location;
    			if (changed.lookAt) gl_group_changes.lookAt = ctx.lookAt;
    			if (changed.up) gl_group_changes.up = ctx.up;
    			if (changed.rotation) gl_group_changes.rotation = ctx.rotation;
    			if (changed.$$scope || changed.w || changed.radius || changed.h || changed.vert || changed.frag || changed.uniforms || changed.blend || changed.depthTest || changed.transparent || changed.cube_corners || changed.edges) gl_group_changes.$$scope = { changed, ctx };
    			gl_group.$set(gl_group_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_group.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_group.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_group, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { corners = true, radius = 0, scale = 1, name = 'face', location = undefined, lookAt = undefined, up = undefined, rotation = undefined, vert = undefined, frag = undefined, uniforms = undefined, blend = undefined, depthTest = undefined, transparent = undefined } = $$props;

    	const writable_props = ['corners', 'radius', 'scale', 'name', 'location', 'lookAt', 'up', 'rotation', 'vert', 'frag', 'uniforms', 'blend', 'depthTest', 'transparent'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<CubeFace> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('corners' in $$props) $$invalidate('corners', corners = $$props.corners);
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    	};

    	$$self.$capture_state = () => {
    		return { corners, radius, scale, name, location, lookAt, up, rotation, vert, frag, uniforms, blend, depthTest, transparent, scale_array, w, h, d, edges, cube_corners };
    	};

    	$$self.$inject_state = $$props => {
    		if ('corners' in $$props) $$invalidate('corners', corners = $$props.corners);
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    		if ('scale_array' in $$props) $$invalidate('scale_array', scale_array = $$props.scale_array);
    		if ('w' in $$props) $$invalidate('w', w = $$props.w);
    		if ('h' in $$props) $$invalidate('h', h = $$props.h);
    		if ('d' in $$props) d = $$props.d;
    		if ('edges' in $$props) $$invalidate('edges', edges = $$props.edges);
    		if ('cube_corners' in $$props) $$invalidate('cube_corners', cube_corners = $$props.cube_corners);
    	};

    	let scale_array, w, h, d, edges, cube_corners;

    	$$self.$$.update = ($$dirty = { scale: 1, scale_array: 1, w: 1, radius: 1, h: 1, corners: 1 }) => {
    		if ($$dirty.scale) { $$invalidate('scale_array', scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale); }
    		if ($$dirty.scale_array) { $$invalidate('w', w = scale_array[0]); }
    		if ($$dirty.scale_array) { $$invalidate('h', h = scale_array[1]); }
    		if ($$dirty.scale_array) { d = scale_array[2]; }
    		if ($$dirty.w || $$dirty.radius || $$dirty.h) { $$invalidate('edges', edges = [
             {
                 location: [w * 0.5 - radius, 0.0, -radius],
                 rotation: [0, 90, 0],
                 scale: [radius, h - 2 * radius, radius]
             },
             {
                 location: [-w * 0.5 + radius, 0.0, -radius],
                 rotation: [0, 0, 0],
                 scale: [radius, h - 2 * radius, radius]
             }
         ]); }
    		if ($$dirty.corners || $$dirty.w || $$dirty.radius || $$dirty.h) { $$invalidate('cube_corners', cube_corners =
           corners ?
           [
             {
                 location: [w * 0.5 - radius, h * 0.5 - radius, -radius],
                 rotation: [0, 90, 0]
             },
             {
                 location: [radius - w * 0.5, h * 0.5 - radius, -radius],
                 rotation: [0, 0, 0]
             },
             {
                 location: [w * 0.5 - radius, radius - h * 0.5, -radius],
                 rotation: [90, 90, 0]
             },
             {
                 location: [radius - w * 0.5, radius - h * 0.5, -radius],
                 rotation: [90, 0, 0]
             }
           ] :
           []); }
    	};

    	return {
    		corners,
    		radius,
    		scale,
    		name,
    		location,
    		lookAt,
    		up,
    		rotation,
    		vert,
    		frag,
    		uniforms,
    		blend,
    		depthTest,
    		transparent,
    		w,
    		h,
    		edges,
    		cube_corners
    	};
    }

    class CubeFace extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["corners", "radius", "scale", "name", "location", "lookAt", "up", "rotation", "vert", "frag", "uniforms", "blend", "depthTest", "transparent"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "CubeFace", options, id: create_fragment$9.name });
    	}

    	get corners() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set corners(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lookAt() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lookAt(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vert() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vert(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frag() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frag(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uniforms() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uniforms(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blend() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blend(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depthTest() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depthTest(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transparent() {
    		throw new Error("<CubeFace>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transparent(value) {
    		throw new Error("<CubeFace>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Cube.svelte generated by Svelte v3.12.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.face = list[i];
    	return child_ctx;
    }

    // (77:2) {#each faces as face}
    function create_each_block$1(ctx) {
    	var current;

    	var cubeface = new CubeFace({
    		props: {
    		corners: ctx.face.corners,
    		radius: ctx.radius,
    		location: ctx.face.location,
    		rotation: ctx.face.rotation,
    		scale: ctx.face.scale,
    		name: ctx.face.name,
    		vert: ctx.vert,
    		frag: ctx.frag,
    		uniforms: ctx.uniforms,
    		blend: ctx.blend,
    		depthTest: ctx.depthTest,
    		transparent: ctx.transparent
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			cubeface.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(cubeface, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var cubeface_changes = {};
    			if (changed.faces) cubeface_changes.corners = ctx.face.corners;
    			if (changed.radius) cubeface_changes.radius = ctx.radius;
    			if (changed.faces) cubeface_changes.location = ctx.face.location;
    			if (changed.faces) cubeface_changes.rotation = ctx.face.rotation;
    			if (changed.faces) cubeface_changes.scale = ctx.face.scale;
    			if (changed.faces) cubeface_changes.name = ctx.face.name;
    			if (changed.vert) cubeface_changes.vert = ctx.vert;
    			if (changed.frag) cubeface_changes.frag = ctx.frag;
    			if (changed.uniforms) cubeface_changes.uniforms = ctx.uniforms;
    			if (changed.blend) cubeface_changes.blend = ctx.blend;
    			if (changed.depthTest) cubeface_changes.depthTest = ctx.depthTest;
    			if (changed.transparent) cubeface_changes.transparent = ctx.transparent;
    			cubeface.$set(cubeface_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(cubeface.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(cubeface.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(cubeface, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(77:2) {#each faces as face}", ctx });
    	return block;
    }

    // (70:0) <GL.Group   location={location}   lookAt={lookAt}   up={up}   rotation={rotation} >
    function create_default_slot$1(ctx) {
    	var each_1_anchor, current;

    	let each_value = ctx.faces;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.faces || changed.radius || changed.vert || changed.frag || changed.uniforms || changed.blend || changed.depthTest || changed.transparent) {
    				each_value = ctx.faces;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(70:0) <GL.Group   location={location}   lookAt={lookAt}   up={up}   rotation={rotation} >", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var current;

    	var gl_group = new Group({
    		props: {
    		location: ctx.location,
    		lookAt: ctx.lookAt,
    		up: ctx.up,
    		rotation: ctx.rotation,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_group.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_group, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_group_changes = {};
    			if (changed.location) gl_group_changes.location = ctx.location;
    			if (changed.lookAt) gl_group_changes.lookAt = ctx.lookAt;
    			if (changed.up) gl_group_changes.up = ctx.up;
    			if (changed.rotation) gl_group_changes.rotation = ctx.rotation;
    			if (changed.$$scope || changed.faces || changed.radius || changed.vert || changed.frag || changed.uniforms || changed.blend || changed.depthTest || changed.transparent) gl_group_changes.$$scope = { changed, ctx };
    			gl_group.$set(gl_group_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_group.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_group.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_group, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	

     let { scale = 1, radius = 0, location = undefined, lookAt = undefined, up = undefined, rotation = undefined, vert = undefined, frag = undefined, uniforms = undefined, blend = undefined, depthTest = undefined, transparent = undefined } = $$props;

    	const writable_props = ['scale', 'radius', 'location', 'lookAt', 'up', 'rotation', 'vert', 'frag', 'uniforms', 'blend', 'depthTest', 'transparent'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Cube> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    	};

    	$$self.$capture_state = () => {
    		return { scale, radius, location, lookAt, up, rotation, vert, frag, uniforms, blend, depthTest, transparent, w, h, d, faces };
    	};

    	$$self.$inject_state = $$props => {
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    		if ('w' in $$props) $$invalidate('w', w = $$props.w);
    		if ('h' in $$props) $$invalidate('h', h = $$props.h);
    		if ('d' in $$props) $$invalidate('d', d = $$props.d);
    		if ('faces' in $$props) $$invalidate('faces', faces = $$props.faces);
    	};

    	let w, h, d, faces;

    	$$self.$$.update = ($$dirty = { scale: 1, w: 1, h: 1, d: 1 }) => {
    		if ($$dirty.scale) { $$invalidate('w', [w, h, d] = typeof scale === 'number' ? [scale, scale, scale] : scale, w, $$invalidate('h', h), $$invalidate('scale', scale), $$invalidate('d', d), $$invalidate('scale', scale)); }
    		if ($$dirty.w || $$dirty.h || $$dirty.d) { $$invalidate('faces', faces = [
             {
                 name: 'right',
                 location: [w * 0.5, 0.0, 0.0],
                 rotation: [90, 0, 90],
                 corners: false,
                 scale: [h, d, 1]
             },
             {
                 name: 'left',
                 location: [-w * 0.5, 0.0, 0.0],
                 rotation: [90, 0, -90],
                 corners: false,
                 scale: [h, d, 1]
             },
             {
                 name: 'top',
                 location: [0.0, h * 0.5, 0.0],
                 rotation: [-90, 90, 0],
                 corners: false,
                 scale: [d, w, 1]
             },
             {
                 name: 'bottom',
                 location: [0.0, -h * 0.5, 0.0],
                 rotation: [90, -90, 0],
                 corners: false,
                 scale: [d, w, 1]
             },
             {
                 name: 'front',
                 location: [0.0, 0.0, d * 0.5],
                 rotation: [0, 0, 0],
                 corners: true,
                 scale: [w, h, 1]
             },
             {
                 name: 'back',
                 location: [0.0, 0.0, -d * 0.5],
                 rotation: [0, 180, 0],
                 corners: true,
                 scale: [w, h, 1]
             }
         ]); }
    	};

    	return {
    		scale,
    		radius,
    		location,
    		lookAt,
    		up,
    		rotation,
    		vert,
    		frag,
    		uniforms,
    		blend,
    		depthTest,
    		transparent,
    		faces
    	};
    }

    class Cube extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["scale", "radius", "location", "lookAt", "up", "rotation", "vert", "frag", "uniforms", "blend", "depthTest", "transparent"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Cube", options, id: create_fragment$a.name });
    	}

    	get scale() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lookAt() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lookAt(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vert() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vert(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frag() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frag(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uniforms() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uniforms(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blend() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blend(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depthTest() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depthTest(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transparent() {
    		throw new Error("<Cube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transparent(value) {
    		throw new Error("<Cube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/LabeledCube.svelte generated by Svelte v3.12.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.face = list[i];
    	return child_ctx;
    }

    // (98:2) {#if labeled_sides.includes(face.name)}
    function create_if_block$1(ctx) {
    	var current;

    	var gl_mesh = new Index({
    		props: {
    		geometry: plane(),
    		location: ctx.face.location,
    		rotation: ctx.face.rotation,
    		scale: ctx.face.scale,
    		vert: ctx.vert,
    		frag: ctx.frag,
    		uniforms: ctx.face.uniforms,
    		blend: ctx.blend,
    		depthTest: ctx.depthTest,
    		transparent: ctx.transparent
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_mesh.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_mesh, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_mesh_changes = {};
    			if (changed.faces) gl_mesh_changes.location = ctx.face.location;
    			if (changed.faces) gl_mesh_changes.rotation = ctx.face.rotation;
    			if (changed.faces) gl_mesh_changes.scale = ctx.face.scale;
    			if (changed.vert) gl_mesh_changes.vert = ctx.vert;
    			if (changed.frag) gl_mesh_changes.frag = ctx.frag;
    			if (changed.faces) gl_mesh_changes.uniforms = ctx.face.uniforms;
    			if (changed.blend) gl_mesh_changes.blend = ctx.blend;
    			if (changed.depthTest) gl_mesh_changes.depthTest = ctx.depthTest;
    			if (changed.transparent) gl_mesh_changes.transparent = ctx.transparent;
    			gl_mesh.$set(gl_mesh_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_mesh.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_mesh.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_mesh, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(98:2) {#if labeled_sides.includes(face.name)}", ctx });
    	return block;
    }

    // (97:2) {#each faces as face}
    function create_each_block$2(ctx) {
    	var show_if = ctx.labeled_sides.includes(ctx.face.name), if_block_anchor, current;

    	var if_block = (show_if) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.labeled_sides || changed.faces) show_if = ctx.labeled_sides.includes(ctx.face.name);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(97:2) {#each faces as face}", ctx });
    	return block;
    }

    // (79:0) <GL.Group   location={location}   lookAt={lookAt}   up={up}   rotation={rotation} >
    function create_default_slot$2(ctx) {
    	var t, each_1_anchor, current;

    	var cube = new Cube({
    		props: {
    		radius: ctx.radius,
    		scale: ctx.scale,
    		vert: ctx.vert,
    		frag: ctx.frag,
    		uniforms: ctx.uniforms,
    		blend: ctx.blend,
    		depthTest: ctx.depthTest,
    		transparent: ctx.transparent
    	},
    		$$inline: true
    	});

    	let each_value = ctx.faces;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			cube.$$.fragment.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			mount_component(cube, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var cube_changes = {};
    			if (changed.radius) cube_changes.radius = ctx.radius;
    			if (changed.scale) cube_changes.scale = ctx.scale;
    			if (changed.vert) cube_changes.vert = ctx.vert;
    			if (changed.frag) cube_changes.frag = ctx.frag;
    			if (changed.uniforms) cube_changes.uniforms = ctx.uniforms;
    			if (changed.blend) cube_changes.blend = ctx.blend;
    			if (changed.depthTest) cube_changes.depthTest = ctx.depthTest;
    			if (changed.transparent) cube_changes.transparent = ctx.transparent;
    			cube.$set(cube_changes);

    			if (changed.labeled_sides || changed.faces || changed.GL || changed.vert || changed.frag || changed.blend || changed.depthTest || changed.transparent) {
    				each_value = ctx.faces;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(cube.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(cube.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(cube, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$2.name, type: "slot", source: "(79:0) <GL.Group   location={location}   lookAt={lookAt}   up={up}   rotation={rotation} >", ctx });
    	return block;
    }

    function create_fragment$b(ctx) {
    	var current;

    	var gl_group = new Group({
    		props: {
    		location: ctx.location,
    		lookAt: ctx.lookAt,
    		up: ctx.up,
    		rotation: ctx.rotation,
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_group.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_group, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_group_changes = {};
    			if (changed.location) gl_group_changes.location = ctx.location;
    			if (changed.lookAt) gl_group_changes.lookAt = ctx.lookAt;
    			if (changed.up) gl_group_changes.up = ctx.up;
    			if (changed.rotation) gl_group_changes.rotation = ctx.rotation;
    			if (changed.$$scope || changed.faces || changed.labeled_sides || changed.vert || changed.frag || changed.blend || changed.depthTest || changed.transparent || changed.radius || changed.scale || changed.uniforms) gl_group_changes.$$scope = { changed, ctx };
    			gl_group.$set(gl_group_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_group.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_group.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_group, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$b.name, type: "component", source: "", ctx });
    	return block;
    }

    const spacing = 0.001;

    function instance$b($$self, $$props, $$invalidate) {
    	

     let { radius = 0.1, margin = 0.2, label_radius = 0.06, label_uniforms = {}, labeled_sides = ['right', 'left', 'top', 'bottom', 'front', 'back'], location = undefined, lookAt = undefined, up = undefined, rotation = undefined, scale = 1, vert = undefined, frag = undefined, uniforms = undefined, blend = undefined, depthTest = undefined, transparent = undefined } = $$props;

    	const writable_props = ['radius', 'margin', 'label_radius', 'label_uniforms', 'labeled_sides', 'location', 'lookAt', 'up', 'rotation', 'scale', 'vert', 'frag', 'uniforms', 'blend', 'depthTest', 'transparent'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<LabeledCube> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('margin' in $$props) $$invalidate('margin', margin = $$props.margin);
    		if ('label_radius' in $$props) $$invalidate('label_radius', label_radius = $$props.label_radius);
    		if ('label_uniforms' in $$props) $$invalidate('label_uniforms', label_uniforms = $$props.label_uniforms);
    		if ('labeled_sides' in $$props) $$invalidate('labeled_sides', labeled_sides = $$props.labeled_sides);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    	};

    	$$self.$capture_state = () => {
    		return { radius, margin, label_radius, label_uniforms, labeled_sides, location, lookAt, up, rotation, scale, vert, frag, uniforms, blend, depthTest, transparent, w, h, d, faces };
    	};

    	$$self.$inject_state = $$props => {
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('margin' in $$props) $$invalidate('margin', margin = $$props.margin);
    		if ('label_radius' in $$props) $$invalidate('label_radius', label_radius = $$props.label_radius);
    		if ('label_uniforms' in $$props) $$invalidate('label_uniforms', label_uniforms = $$props.label_uniforms);
    		if ('labeled_sides' in $$props) $$invalidate('labeled_sides', labeled_sides = $$props.labeled_sides);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('vert' in $$props) $$invalidate('vert', vert = $$props.vert);
    		if ('frag' in $$props) $$invalidate('frag', frag = $$props.frag);
    		if ('uniforms' in $$props) $$invalidate('uniforms', uniforms = $$props.uniforms);
    		if ('blend' in $$props) $$invalidate('blend', blend = $$props.blend);
    		if ('depthTest' in $$props) $$invalidate('depthTest', depthTest = $$props.depthTest);
    		if ('transparent' in $$props) $$invalidate('transparent', transparent = $$props.transparent);
    		if ('w' in $$props) $$invalidate('w', w = $$props.w);
    		if ('h' in $$props) $$invalidate('h', h = $$props.h);
    		if ('d' in $$props) $$invalidate('d', d = $$props.d);
    		if ('faces' in $$props) $$invalidate('faces', faces = $$props.faces);
    	};

    	let w, h, d, faces;

    	$$self.$$.update = ($$dirty = { scale: 1, w: 1, h: 1, margin: 1, d: 1, label_uniforms: 1 }) => {
    		if ($$dirty.scale) { $$invalidate('w', [w, h, d] = typeof scale === 'number' ? [scale, scale, scale] : scale, w, $$invalidate('h', h), $$invalidate('scale', scale), $$invalidate('d', d), $$invalidate('scale', scale)); }
    		if ($$dirty.w || $$dirty.h || $$dirty.margin || $$dirty.d || $$dirty.label_uniforms) { $$invalidate('faces', faces = [
             {
                 name: 'right',
                 location: [w * 0.5 + spacing, 0.0, 0.0],
                 rotation: [90, 0, 90],
                 scale: [h/2 - margin, d/2 - margin, 1/2],
                 uniforms: label_uniforms.right
             },
             {
                 name: 'left',
                 location: [-w * 0.5 - spacing, 0.0, 0.0],
                 rotation: [90, 0, -90],
                 scale: [h/2 - margin, d/2 - margin, 1/2],
                 uniforms: label_uniforms.left
             },
             {
                 name: 'top',
                 location: [0.0, h * 0.5 + spacing, 0.0],
                 rotation: [-90, 90, 0],
                 scale: [d/2 - margin, w/2 - margin, 1/2],
                 uniforms: label_uniforms.top
             },
             {
                 name: 'bottom',
                 location: [0.0, -h * 0.5 - spacing, 0.0],
                 rotation: [90, -90, 0],
                 corners: false,
                 scale: [d/2 - margin, w/2 - margin, 1/2],
                 uniforms: label_uniforms.bottom
             },
             {
                 name: 'front',
                 location: [0.0, 0.0, d * 0.5 + spacing],
                 rotation: [0, 0, 0],
                 corners: true,
                 scale: [w/2 - margin, h/2 - margin, 1/2],
                 uniforms: label_uniforms.front
             },
             {
                 name: 'back',
                 location: [0.0, 0.0, -d * 0.5 - spacing],
                 rotation: [0, 180, 0],
                 corners: true,
                 scale: [w/2 - margin, h/2 - margin, 1/2],
                 uniforms: label_uniforms.back
             }
         ]); }
    	};

    	return {
    		radius,
    		margin,
    		label_radius,
    		label_uniforms,
    		labeled_sides,
    		location,
    		lookAt,
    		up,
    		rotation,
    		scale,
    		vert,
    		frag,
    		uniforms,
    		blend,
    		depthTest,
    		transparent,
    		faces
    	};
    }

    class LabeledCube extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["radius", "margin", "label_radius", "label_uniforms", "labeled_sides", "location", "lookAt", "up", "rotation", "scale", "vert", "frag", "uniforms", "blend", "depthTest", "transparent"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "LabeledCube", options, id: create_fragment$b.name });
    	}

    	get radius() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label_radius() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label_radius(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label_uniforms() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label_uniforms(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labeled_sides() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labeled_sides(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lookAt() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lookAt(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vert() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vert(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frag() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frag(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uniforms() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uniforms(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blend() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blend(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depthTest() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depthTest(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transparent() {
    		throw new Error("<LabeledCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transparent(value) {
    		throw new Error("<LabeledCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MagicCube.svelte generated by Svelte v3.12.1 */

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.column = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.face = list[i];
    	return child_ctx;
    }

    // (72:8) {#each [0, 1, 2] as column}
    function create_each_block_2(ctx) {
    	var current;

    	var labeledcube = new LabeledCube({
    		props: {
    		scale: 1/3,
    		location: [(ctx.column - 1)/3, (1 - ctx.row)/3, 0],
    		radius: ctx.radius/3,
    		margin: ctx.margin/3,
    		label_uniforms: ctx.label_uniforms,
    		labeled_sides: ctx.cubesLabeledSides[ctx.face][ctx.row][ctx.column],
    		uniforms: ctx.uniforms
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			labeledcube.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(labeledcube, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(labeledcube.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(labeledcube.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(labeledcube, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(72:8) {#each [0, 1, 2] as column}", ctx });
    	return block;
    }

    // (71:6) {#each [0, 1, 2] as row}
    function create_each_block_1$1(ctx) {
    	var each_1_anchor, current;

    	let each_value_2 = [0, 1, 2];

    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.radius || changed.margin || changed.label_uniforms || changed.cubesLabeledSides || changed.uniforms) {
    				each_value_2 = [0, 1, 2];

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value_2.length; i < 3; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < 3; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < 3; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(71:6) {#each [0, 1, 2] as row}", ctx });
    	return block;
    }

    // (67:4) <GL.Group       location = {facePositions[face].location}       rotation = {facePositions[face].rotation}     >
    function create_default_slot_1(ctx) {
    	var t, current;

    	let each_value_1 = [0, 1, 2];

    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.radius || changed.margin || changed.label_uniforms || changed.cubesLabeledSides || changed.uniforms) {
    				each_value_1 = [0, 1, 2];

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();
    				for (i = each_value_1.length; i < 3; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < 3; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < 3; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(67:4) <GL.Group       location = {facePositions[face].location}       rotation = {facePositions[face].rotation}     >", ctx });
    	return block;
    }

    // (66:2) {#each [0, 1, 2] as face}
    function create_each_block$3(ctx) {
    	var current;

    	var gl_group = new Group({
    		props: {
    		location: ctx.facePositions[ctx.face].location,
    		rotation: ctx.facePositions[ctx.face].rotation,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_group.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_group, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_group_changes = {};
    			if (changed.facePositions) gl_group_changes.location = ctx.facePositions[ctx.face].location;
    			if (changed.facePositions) gl_group_changes.rotation = ctx.facePositions[ctx.face].rotation;
    			if (changed.$$scope) gl_group_changes.$$scope = { changed, ctx };
    			gl_group.$set(gl_group_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_group.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_group.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_group, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(66:2) {#each [0, 1, 2] as face}", ctx });
    	return block;
    }

    // (58:0) <GL.Group   {location}   {lookAt}   {up}   {rotation}   {scale} >
    function create_default_slot$3(ctx) {
    	var each_1_anchor, current;

    	let each_value = [0, 1, 2];

    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.facePositions || changed.radius || changed.margin || changed.label_uniforms || changed.cubesLabeledSides || changed.uniforms) {
    				each_value = [0, 1, 2];

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < 3; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < 3; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < 3; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$3.name, type: "slot", source: "(58:0) <GL.Group   {location}   {lookAt}   {up}   {rotation}   {scale} >", ctx });
    	return block;
    }

    function create_fragment$c(ctx) {
    	var current;

    	var gl_group = new Group({
    		props: {
    		location: ctx.location,
    		lookAt: ctx.lookAt,
    		up: ctx.up,
    		rotation: ctx.rotation,
    		scale: ctx.scale,
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_group.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_group, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_group_changes = {};
    			if (changed.location) gl_group_changes.location = ctx.location;
    			if (changed.lookAt) gl_group_changes.lookAt = ctx.lookAt;
    			if (changed.up) gl_group_changes.up = ctx.up;
    			if (changed.rotation) gl_group_changes.rotation = ctx.rotation;
    			if (changed.scale) gl_group_changes.scale = ctx.scale;
    			if (changed.$$scope || changed.facePositions) gl_group_changes.$$scope = { changed, ctx };
    			gl_group.$set(gl_group_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_group.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_group.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_group, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$c.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	

     // pass to Group
     let { scale = 1, face_angle = 20, location = undefined, lookAt = undefined, up = undefined, rotation = undefined } = $$props;

     const radius = 0.06,
       margin = 0.08,
       uniforms = { color: 0x101010, specularity: 0.4, alpha: 1.0 },
       label_uniforms = {
           front:  {color: 0xf1f5fe, specularity: 0.3}, // white
           left:   {color: 0x8080ff, specularity: 0.3}, // blue
           top:    {color: 0xd4001e, specularity: 0.3}, // red
           right:  {color: 0x008452, specularity: 0.3}, // green
           bottom: {color: 0xf46c3a, specularity: 0.3}, // orange
           back:   {color: 0xf7e42d, specularity: 0.3}  // yellow
       },
       cubesLabeledSides = [
           [
               [['front', 'left', 'top'], ['front', 'top'], ['front', 'top', 'right']],
               [['left', 'front'], ['front'], ['front', 'right']],
               [['front', 'left', 'bottom'], ['front', 'bottom'], ['front', 'bottom', 'right']]
           ],
           [
               [['left', 'top'], ['top'], ['top', 'right']],
               [['left'], [], ['right']],
               [['left', 'bottom'], ['bottom'], ['bottom', 'right']]
           ],
           [
               [['back', 'left', 'top'], ['back', 'top'], ['back', 'top', 'right']],
               [['left', 'back'], ['back'], ['back', 'right']],
               [['back', 'left', 'bottom'], ['back', 'bottom'], ['back', 'bottom', 'right']]
           ]
       ];

    	const writable_props = ['scale', 'face_angle', 'location', 'lookAt', 'up', 'rotation'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MagicCube> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('face_angle' in $$props) $$invalidate('face_angle', face_angle = $$props.face_angle);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => {
    		return { scale, face_angle, location, lookAt, up, rotation, facePositions };
    	};

    	$$self.$inject_state = $$props => {
    		if ('scale' in $$props) $$invalidate('scale', scale = $$props.scale);
    		if ('face_angle' in $$props) $$invalidate('face_angle', face_angle = $$props.face_angle);
    		if ('location' in $$props) $$invalidate('location', location = $$props.location);
    		if ('lookAt' in $$props) $$invalidate('lookAt', lookAt = $$props.lookAt);
    		if ('up' in $$props) $$invalidate('up', up = $$props.up);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    		if ('facePositions' in $$props) $$invalidate('facePositions', facePositions = $$props.facePositions);
    	};

    	let facePositions;

    	$$self.$$.update = ($$dirty = { face_angle: 1 }) => {
    		if ($$dirty.face_angle) { $$invalidate('facePositions', facePositions = [
             {
                 location: [0, 0, 1/3],
                 rotation: [0, 0, face_angle]
             },
             {
                 location: [0, 0, 0],
                 rotation: [0, 0, 0]
             },
             {
                 location: [0, 0, -1/3],
                 rotation: [0, 0, 0]
             }
         ]); }
    	};

    	return {
    		scale,
    		face_angle,
    		location,
    		lookAt,
    		up,
    		rotation,
    		radius,
    		margin,
    		uniforms,
    		label_uniforms,
    		cubesLabeledSides,
    		facePositions
    	};
    }

    class MagicCube extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, ["scale", "face_angle", "location", "lookAt", "up", "rotation"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "MagicCube", options, id: create_fragment$c.name });
    	}

    	get scale() {
    		throw new Error("<MagicCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<MagicCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get face_angle() {
    		throw new Error("<MagicCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set face_angle(value) {
    		throw new Error("<MagicCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<MagicCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<MagicCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lookAt() {
    		throw new Error("<MagicCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lookAt(value) {
    		throw new Error("<MagicCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get up() {
    		throw new Error("<MagicCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set up(value) {
    		throw new Error("<MagicCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<MagicCube>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<MagicCube>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/App.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.cubeType = list[i];
    	return child_ctx;
    }

    // (70:2) <GL.OrbitControls maxPolarAngle={Math.PI} let:location>
    function create_default_slot_2(ctx) {
    	var current;

    	var gl_perspectivecamera = new PerspectiveCamera({
    		props: {
    		location: ctx.location,
    		lookAt: "center",
    		near: 0.01,
    		far: 1000
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_perspectivecamera.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_perspectivecamera, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_perspectivecamera_changes = {};
    			if (changed.location) gl_perspectivecamera_changes.location = ctx.location;
    			gl_perspectivecamera.$set(gl_perspectivecamera_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_perspectivecamera.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_perspectivecamera.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_perspectivecamera, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(70:2) <GL.OrbitControls maxPolarAngle={Math.PI} let:location>", ctx });
    	return block;
    }

    // (104:4) {:else}
    function create_else_block(ctx) {
    	var current;

    	var magiccube = new MagicCube({
    		props: {
    		location: [0, ctx.h/2 * 2, 0],
    		rotation: [0,20,0],
    		scale: [ctx.w * 2,ctx.h * 2,ctx.d * 2],
    		face_angle: ctx.face.angle
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			magiccube.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(magiccube, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var magiccube_changes = {};
    			if (changed.h) magiccube_changes.location = [0, ctx.h/2 * 2, 0];
    			if (changed.w || changed.h || changed.d) magiccube_changes.scale = [ctx.w * 2,ctx.h * 2,ctx.d * 2];
    			if (changed.face) magiccube_changes.face_angle = ctx.face.angle;
    			magiccube.$set(magiccube_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(magiccube.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(magiccube.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(magiccube, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(104:4) {:else}", ctx });
    	return block;
    }

    // (96:38) 
    function create_if_block_2(ctx) {
    	var current;

    	var cube = new Cube({
    		props: {
    		location: [0, ctx.h/2, 0],
    		rotation: [0,20,0],
    		scale: [ctx.w,ctx.h,ctx.d],
    		radius: ctx.radius,
    		uniforms: { color: ctx.from_hex(ctx.color), alpha: 1.0 }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			cube.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(cube, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var cube_changes = {};
    			if (changed.h) cube_changes.location = [0, ctx.h/2, 0];
    			if (changed.w || changed.h || changed.d) cube_changes.scale = [ctx.w,ctx.h,ctx.d];
    			if (changed.radius) cube_changes.radius = ctx.radius;
    			if (changed.color) cube_changes.uniforms = { color: ctx.from_hex(ctx.color), alpha: 1.0 };
    			cube.$set(cube_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(cube.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(cube.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(cube, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(96:38) ", ctx });
    	return block;
    }

    // (86:2) {#if showCubeType === 'LabeledCube'}
    function create_if_block_1(ctx) {
    	var current;

    	var labeledcube = new LabeledCube({
    		props: {
    		location: [0, ctx.h/2, 0],
    		rotation: [0,20,0],
    		scale: [ctx.w,ctx.h,ctx.d],
    		radius: ctx.radius,
    		margin: margin,
    		label_uniforms: ctx.label_uniforms,
    		uniforms: { color: 0x101010, specularity: 0.4, alpha: 1.0 }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			labeledcube.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(labeledcube, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var labeledcube_changes = {};
    			if (changed.h) labeledcube_changes.location = [0, ctx.h/2, 0];
    			if (changed.w || changed.h || changed.d) labeledcube_changes.scale = [ctx.w,ctx.h,ctx.d];
    			if (changed.radius) labeledcube_changes.radius = ctx.radius;
    			labeledcube.$set(labeledcube_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(labeledcube.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(labeledcube.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(labeledcube, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(86:2) {#if showCubeType === 'LabeledCube'}", ctx });
    	return block;
    }

    // (114:4) {#if show_light}
    function create_if_block$2(ctx) {
    	var current;

    	var gl_mesh = new Index({
    		props: {
    		geometry: sphere({ turns: 36, bands: 36 }),
    		location: [0,0.2,0],
    		scale: 0.1,
    		uniforms: { color: ctx.from_hex(ctx.light_color), emissive: 0xcccc99 }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_mesh.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_mesh, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_mesh_changes = {};
    			if (changed.light_color) gl_mesh_changes.uniforms = { color: ctx.from_hex(ctx.light_color), emissive: 0xcccc99 };
    			gl_mesh.$set(gl_mesh_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_mesh.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_mesh.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_mesh, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(114:4) {#if show_light}", ctx });
    	return block;
    }

    // (113:2) <GL.Group location={[light.x,light.y,light.z]}>
    function create_default_slot_1$1(ctx) {
    	var t, current;

    	var if_block = (ctx.show_light) && create_if_block$2(ctx);

    	var gl_pointlight = new PointLight({
    		props: {
    		location: [0,0,0],
    		color: ctx.from_hex(ctx.light_color),
    		intensity: 0.6
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			gl_pointlight.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(gl_pointlight, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.show_light) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			var gl_pointlight_changes = {};
    			if (changed.light_color) gl_pointlight_changes.color = ctx.from_hex(ctx.light_color);
    			gl_pointlight.$set(gl_pointlight_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			transition_in(gl_pointlight.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(gl_pointlight.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(gl_pointlight, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1$1.name, type: "slot", source: "(113:2) <GL.Group location={[light.x,light.y,light.z]}>", ctx });
    	return block;
    }

    // (67:0) <GL.Scene>
    function create_default_slot$4(ctx) {
    	var t0, t1, t2, t3, t4, current_block_type_index, if_block, t5, current;

    	var gl_target = new Target({
    		props: { id: "center", location: [0, ctx.h/2, 0] },
    		$$inline: true
    	});

    	var gl_orbitcontrols = new OrbitControls({
    		props: {
    		maxPolarAngle: ctx.Math.PI,
    		$$slots: {
    		default: [create_default_slot_2, ({ location }) => ({ location })]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var gl_ambientlight = new AmbientLight({
    		props: { intensity: 0.5 },
    		$$inline: true
    	});

    	var gl_directionallight = new DirectionalLight({
    		props: {
    		direction: [-1,-1,-1],
    		intensity: 0.5
    	},
    		$$inline: true
    	});

    	var gl_mesh = new Index({
    		props: {
    		geometry: plane(),
    		location: [0,-0.01,0],
    		rotation: [-90,0,0],
    		scale: 10,
    		uniforms: { color: 0xffffff }
    	},
    		$$inline: true
    	});

    	var if_block_creators = [
    		create_if_block_1,
    		create_if_block_2,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.showCubeType === 'LabeledCube') return 0;
    		if (ctx.showCubeType === 'Cube') return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	var gl_group = new Group({
    		props: {
    		location: [ctx.light.x,ctx.light.y,ctx.light.z],
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			gl_target.$$.fragment.c();
    			t0 = space();
    			gl_orbitcontrols.$$.fragment.c();
    			t1 = space();
    			gl_ambientlight.$$.fragment.c();
    			t2 = space();
    			gl_directionallight.$$.fragment.c();
    			t3 = space();
    			gl_mesh.$$.fragment.c();
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			gl_group.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_target, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(gl_orbitcontrols, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(gl_ambientlight, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(gl_directionallight, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(gl_mesh, target, anchor);
    			insert_dev(target, t4, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(gl_group, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_target_changes = {};
    			if (changed.h) gl_target_changes.location = [0, ctx.h/2, 0];
    			gl_target.$set(gl_target_changes);

    			var gl_orbitcontrols_changes = {};
    			if (changed.$$scope) gl_orbitcontrols_changes.$$scope = { changed, ctx };
    			gl_orbitcontrols.$set(gl_orbitcontrols_changes);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(t5.parentNode, t5);
    			}

    			var gl_group_changes = {};
    			if (changed.light) gl_group_changes.location = [ctx.light.x,ctx.light.y,ctx.light.z];
    			if (changed.$$scope || changed.light_color || changed.show_light) gl_group_changes.$$scope = { changed, ctx };
    			gl_group.$set(gl_group_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_target.$$.fragment, local);

    			transition_in(gl_orbitcontrols.$$.fragment, local);

    			transition_in(gl_ambientlight.$$.fragment, local);

    			transition_in(gl_directionallight.$$.fragment, local);

    			transition_in(gl_mesh.$$.fragment, local);

    			transition_in(if_block);

    			transition_in(gl_group.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_target.$$.fragment, local);
    			transition_out(gl_orbitcontrols.$$.fragment, local);
    			transition_out(gl_ambientlight.$$.fragment, local);
    			transition_out(gl_directionallight.$$.fragment, local);
    			transition_out(gl_mesh.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(gl_group.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_target, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(gl_orbitcontrols, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(gl_ambientlight, detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			destroy_component(gl_directionallight, detaching);

    			if (detaching) {
    				detach_dev(t3);
    			}

    			destroy_component(gl_mesh, detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(t5);
    			}

    			destroy_component(gl_group, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$4.name, type: "slot", source: "(67:0) <GL.Scene>", ctx });
    	return block;
    }

    // (143:2) {#each ['Cube', 'LabeledCube', 'MagicCube'] as cubeType}
    function create_each_block$4(ctx) {
    	var label, input, t0, t1, dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(ctx.cubeType);
    			ctx.$$binding_groups[0].push(input);
    			attr_dev(input, "type", "radio");
    			input.__value = ctx.cubeType;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-h1ar7z");
    			add_location(input, file$1, 144, 6, 3716);
    			add_location(label, file$1, 143, 4, 3702);
    			dispose = listen_dev(input, "change", ctx.input_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);

    			input.checked = input.__value === ctx.showCubeType;

    			append_dev(label, t0);
    			append_dev(label, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.showCubeType) input.checked = input.__value === ctx.showCubeType;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(label);
    			}

    			ctx.$$binding_groups[0].splice(ctx.$$binding_groups[0].indexOf(input), 1);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(143:2) {#each ['Cube', 'LabeledCube', 'MagicCube'] as cubeType}", ctx });
    	return block;
    }

    function create_fragment$d(ctx) {
    	var t0, div, label0, input0, t1, t2, t3, t4, label1, input1, t5, t6, t7, t8, label2, input2, t9, t10, label3, input3, t11, t12, t13, label4, input4, t14, t15, t16, t17, label5, input5, t18, t19, t20, t21, label6, input6, t22, t23, t24, t25, label7, input7, t26, t27, t28, current, dispose;

    	var gl_scene = new Scene({
    		props: {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	let each_value = ['Cube', 'LabeledCube', 'MagicCube'];

    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			gl_scene.$$.fragment.c();
    			t0 = space();
    			div = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t1 = text(" box (");
    			t2 = text(ctx.color);
    			t3 = text(")");
    			t4 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t5 = text(" light (");
    			t6 = text(ctx.light_color);
    			t7 = text(")");
    			t8 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t9 = text(" Show light?");
    			t10 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t11 = text(" Move light?");
    			t12 = space();

    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			label4 = element("label");
    			input4 = element("input");
    			t14 = text(" width (");
    			t15 = text(ctx.w);
    			t16 = text(")");
    			t17 = space();
    			label5 = element("label");
    			input5 = element("input");
    			t18 = text(" height (");
    			t19 = text(ctx.h);
    			t20 = text(")");
    			t21 = space();
    			label6 = element("label");
    			input6 = element("input");
    			t22 = text(" depth (");
    			t23 = text(ctx.d);
    			t24 = text(")");
    			t25 = space();
    			label7 = element("label");
    			input7 = element("input");
    			t26 = text(" radius (");
    			t27 = text(ctx.radius);
    			t28 = text(")");
    			attr_dev(input0, "type", "color");
    			set_style(input0, "height", "40px");
    			add_location(input0, file$1, 131, 4, 3261);
    			add_location(label0, file$1, 130, 2, 3249);
    			attr_dev(input1, "type", "color");
    			set_style(input1, "height", "40px");
    			add_location(input1, file$1, 134, 4, 3361);
    			add_location(label1, file$1, 133, 2, 3349);
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file$1, 137, 4, 3475);
    			add_location(label2, file$1, 136, 2, 3463);
    			attr_dev(input3, "type", "checkbox");
    			add_location(input3, file$1, 140, 4, 3564);
    			add_location(label3, file$1, 139, 2, 3552);
    			attr_dev(input4, "type", "range");
    			attr_dev(input4, "min", 0.1);
    			attr_dev(input4, "max", 5);
    			attr_dev(input4, "step", 0.1);
    			add_location(input4, file$1, 148, 4, 3830);
    			add_location(label4, file$1, 147, 2, 3818);
    			attr_dev(input5, "type", "range");
    			attr_dev(input5, "min", 0.1);
    			attr_dev(input5, "max", 5);
    			attr_dev(input5, "step", 0.1);
    			add_location(input5, file$1, 152, 4, 3933);
    			add_location(label5, file$1, 151, 2, 3921);
    			attr_dev(input6, "type", "range");
    			attr_dev(input6, "min", 0.1);
    			attr_dev(input6, "max", 5);
    			attr_dev(input6, "step", 0.1);
    			add_location(input6, file$1, 156, 4, 4037);
    			add_location(label6, file$1, 155, 2, 4025);
    			attr_dev(input7, "type", "range");
    			attr_dev(input7, "min", 0.01);
    			attr_dev(input7, "max", 0.5);
    			attr_dev(input7, "step", 0.01);
    			add_location(input7, file$1, 160, 4, 4140);
    			add_location(label7, file$1, 159, 2, 4128);
    			attr_dev(div, "class", "controls svelte-h1ar7z");
    			add_location(div, file$1, 129, 0, 3224);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(input2, "change", ctx.input2_change_handler),
    				listen_dev(input3, "change", ctx.input3_change_handler),
    				listen_dev(input4, "change", ctx.input4_change_input_handler),
    				listen_dev(input4, "input", ctx.input4_change_input_handler),
    				listen_dev(input5, "change", ctx.input5_change_input_handler),
    				listen_dev(input5, "input", ctx.input5_change_input_handler),
    				listen_dev(input6, "change", ctx.input6_change_input_handler),
    				listen_dev(input6, "input", ctx.input6_change_input_handler),
    				listen_dev(input7, "change", ctx.input7_change_input_handler),
    				listen_dev(input7, "input", ctx.input7_change_input_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(gl_scene, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label0);
    			append_dev(label0, input0);

    			set_input_value(input0, ctx.color);

    			append_dev(label0, t1);
    			append_dev(label0, t2);
    			append_dev(label0, t3);
    			append_dev(div, t4);
    			append_dev(div, label1);
    			append_dev(label1, input1);

    			set_input_value(input1, ctx.light_color);

    			append_dev(label1, t5);
    			append_dev(label1, t6);
    			append_dev(label1, t7);
    			append_dev(div, t8);
    			append_dev(div, label2);
    			append_dev(label2, input2);

    			input2.checked = ctx.show_light;

    			append_dev(label2, t9);
    			append_dev(div, t10);
    			append_dev(div, label3);
    			append_dev(label3, input3);

    			input3.checked = ctx.move_light;

    			append_dev(label3, t11);
    			append_dev(div, t12);

    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t13);
    			append_dev(div, label4);
    			append_dev(label4, input4);

    			set_input_value(input4, ctx.w);

    			append_dev(label4, t14);
    			append_dev(label4, t15);
    			append_dev(label4, t16);
    			append_dev(div, t17);
    			append_dev(div, label5);
    			append_dev(label5, input5);

    			set_input_value(input5, ctx.h);

    			append_dev(label5, t18);
    			append_dev(label5, t19);
    			append_dev(label5, t20);
    			append_dev(div, t21);
    			append_dev(div, label6);
    			append_dev(label6, input6);

    			set_input_value(input6, ctx.d);

    			append_dev(label6, t22);
    			append_dev(label6, t23);
    			append_dev(label6, t24);
    			append_dev(div, t25);
    			append_dev(div, label7);
    			append_dev(label7, input7);

    			set_input_value(input7, ctx.radius);

    			append_dev(label7, t26);
    			append_dev(label7, t27);
    			append_dev(label7, t28);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gl_scene_changes = {};
    			if (changed.$$scope || changed.light || changed.light_color || changed.show_light || changed.showCubeType || changed.h || changed.w || changed.d || changed.radius || changed.color || changed.face) gl_scene_changes.$$scope = { changed, ctx };
    			gl_scene.$set(gl_scene_changes);

    			if (changed.color) set_input_value(input0, ctx.color);

    			if (!current || changed.color) {
    				set_data_dev(t2, ctx.color);
    			}

    			if (changed.light_color) set_input_value(input1, ctx.light_color);

    			if (!current || changed.light_color) {
    				set_data_dev(t6, ctx.light_color);
    			}

    			if (changed.show_light) input2.checked = ctx.show_light;
    			if (changed.move_light) input3.checked = ctx.move_light;

    			if (changed.showCubeType) {
    				each_value = ['Cube', 'LabeledCube', 'MagicCube'];

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t13);
    					}
    				}

    				for (; i < 3; i += 1) {
    					each_blocks[i].d(1);
    				}
    			}

    			if (changed.w) set_input_value(input4, ctx.w);

    			if (!current || changed.w) {
    				set_data_dev(t15, ctx.w);
    			}

    			if (changed.h) set_input_value(input5, ctx.h);

    			if (!current || changed.h) {
    				set_data_dev(t19, ctx.h);
    			}

    			if (changed.d) set_input_value(input6, ctx.d);

    			if (!current || changed.d) {
    				set_data_dev(t23, ctx.d);
    			}

    			if (changed.radius) set_input_value(input7, ctx.radius);

    			if (!current || changed.radius) {
    				set_data_dev(t27, ctx.radius);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gl_scene.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gl_scene.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gl_scene, detaching);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$d.name, type: "component", source: "", ctx });
    	return block;
    }

    let margin = 0.08;

    let show_labeled = false;

    let face_angle = 30;

    let rotate_face = true;

    function instance$d($$self, $$props, $$invalidate) {
    	

     let { color = '#ff3e00', name = 'App' } = $$props;
     let w = 1;
     let h = 1;
     let d = 1;
     let radius = 0.06;
     let move_light = false;
     let show_light = false;
     let light_color = '#ffffff';
     let showCubeType = 'MagicCube';

     const from_hex = hex => parseInt(hex.slice(1), 16);

     const light = {
         x: 3,
         y: 4.5,
         z: 3
     };

     const label_uniforms = {
         front:  {color: 0xf1f5fe, specularity: 0.3}, // white
         left:   {color: 0x8080ff, specularity: 0.3}, // blue
         top:    {color: 0xd4001e, specularity: 0.3}, // red
         right:  {color: 0x008452, specularity: 0.3}, // green
         bottom: {color: 0xf46c3a, specularity: 0.3}, // orange
         back:   {color: 0xf7e42d, specularity: 0.3}  // yellow
     };

     const face = {
         angle: 20
     };

     onMount(() => {
         let frame;

         const loop = () => {
       frame = requestAnimationFrame(loop);
             if (rotate_face) {
                 $$invalidate('face', face.angle = face.angle + 1, face);
    //             face_angle = 3 * Math.sin(Date.now() * 0.1);
             }
             if (move_light) {
                 $$invalidate('light', light.x = 3 * Math.sin(Date.now() * 0.001), light);
                 $$invalidate('light', light.y = 2.5 + 2 * Math.sin(Date.now() * 0.0004), light);
                 $$invalidate('light', light.z = 3 * Math.cos(Date.now() * 0.002), light);
             }
         };

         loop();

         return () => cancelAnimationFrame(frame);
     });

    	const writable_props = ['color', 'name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		color = this.value;
    		$$invalidate('color', color);
    	}

    	function input1_input_handler() {
    		light_color = this.value;
    		$$invalidate('light_color', light_color);
    	}

    	function input2_change_handler() {
    		show_light = this.checked;
    		$$invalidate('show_light', show_light);
    	}

    	function input3_change_handler() {
    		move_light = this.checked;
    		$$invalidate('move_light', move_light);
    	}

    	function input_change_handler() {
    		showCubeType = this.__value;
    		$$invalidate('showCubeType', showCubeType);
    	}

    	function input4_change_input_handler() {
    		w = to_number(this.value);
    		$$invalidate('w', w);
    	}

    	function input5_change_input_handler() {
    		h = to_number(this.value);
    		$$invalidate('h', h);
    	}

    	function input6_change_input_handler() {
    		d = to_number(this.value);
    		$$invalidate('d', d);
    	}

    	function input7_change_input_handler() {
    		radius = to_number(this.value);
    		$$invalidate('radius', radius);
    	}

    	$$self.$set = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { color, name, w, h, d, radius, margin, move_light, show_light, show_labeled, light_color, showCubeType, face_angle, rotate_face };
    	};

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('w' in $$props) $$invalidate('w', w = $$props.w);
    		if ('h' in $$props) $$invalidate('h', h = $$props.h);
    		if ('d' in $$props) $$invalidate('d', d = $$props.d);
    		if ('radius' in $$props) $$invalidate('radius', radius = $$props.radius);
    		if ('margin' in $$props) $$invalidate('margin', margin = $$props.margin);
    		if ('move_light' in $$props) $$invalidate('move_light', move_light = $$props.move_light);
    		if ('show_light' in $$props) $$invalidate('show_light', show_light = $$props.show_light);
    		if ('show_labeled' in $$props) show_labeled = $$props.show_labeled;
    		if ('light_color' in $$props) $$invalidate('light_color', light_color = $$props.light_color);
    		if ('showCubeType' in $$props) $$invalidate('showCubeType', showCubeType = $$props.showCubeType);
    		if ('face_angle' in $$props) face_angle = $$props.face_angle;
    		if ('rotate_face' in $$props) rotate_face = $$props.rotate_face;
    	};

    	return {
    		color,
    		name,
    		w,
    		h,
    		d,
    		radius,
    		move_light,
    		show_light,
    		light_color,
    		showCubeType,
    		from_hex,
    		light,
    		label_uniforms,
    		face,
    		Math,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input_change_handler,
    		input4_change_input_handler,
    		input5_change_input_handler,
    		input6_change_input_handler,
    		input7_change_input_handler,
    		$$binding_groups
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, ["color", "name"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$d.name });
    	}

    	get color() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
