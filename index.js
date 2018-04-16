define(() => {

  class Checkbox extends Jinkela {
    set disabled(value) { this.element.classList[value ? 'add' : 'remove']('disabled'); }
    get disabled() { return this.element.classList.contains('disabled'); }

    get checked() { return this.element.classList.contains('checked'); }
    set checked(value) {
      value = !!value;
      if (value === this.checked) return;
      this.element.classList[value ? 'add' : 'remove']('checked');
    }

    get touched() { return this.element.classList.contains('touched'); }
    set touched(value) {
      value = !!value;
      if (value === this.touched) return;
      this.element.classList[value ? 'add' : 'remove']('touched');
    }

    get styleSheet() {
      return `
        :scope {
          margin-right: 10px;
          cursor: pointer;
          font-size: 14px;
          --ease: cubic-bezier(.71,-.46,.29,1.46);
          font-size: 14px;
          display: inline-block;
          vertical-align: middle;
          color: #48576a;
          box-sizing: border-box;
          position: relative;
          width: 1em;
          height: 1em;
          border: 1px solid #bfcbd9;
          border-radius: 4px;
          transition: border-color .25s var(--ease), background-color .25s var(--ease);
          &::after {
            box-sizing: content-box;
            content: '';
            position: absolute;
            transform: rotate(45deg) scaleY(0);
            transition: transform .15s var(--ease) .05s;
            transform-origin: center;
          }
          &:hover { border-color: #0190fe; }
          &.touched {
            background-color: #20a0ff;
            border-color: #0190fe;
            &::after {
              border: 1px solid #fff;
              border-left: 0;
              border-top: 0;
              height: 0px;
              left: 3px;
              top: 6px;
              width: 5px;
              transform: rotate(0deg) scaleY(1);
            }
            &.disabled {
              background-color: #f2f6fc;
              border-color: #dcdfe6;
              &::after { border-color: #c0c4cc; }
            }
          }
          &.checked {
            background-color: #20a0ff;
            border-color: #0190fe;
            &::after {
              border: 1px solid #fff;
              border-left: 0;
              border-top: 0;
              height: 7px;
              left: 4px;
              top: 1px;
              width: 3px;
              transform: rotate(45deg) scaleY(1);
            }
            &.disabled {
              background-color: #f2f6fc;
              border-color: #dcdfe6;
              &::after { border-color: #c0c4cc; }
            }
          }
          &.disabled {
            background-color: #edf2fc;
            border-color: #dcdfe6;
            cursor: not-allowed;
          }
        }
      `;
    }
  }

  class Triangle extends Jinkela {
    init() {
      Object.defineProperty(this, '$hasInit', { value: true, configurable: true });
      this.update();
      this.element.classList.add('triangle');
    }
    update() {
      if (!this.$hasInit) return;
      this.element.style.transform = `rotate(${this.value ? this.true : this.false})`;
    }
    get value() { return this.$value; }
    set value(value) {
      Object.defineProperty(this, '$value', { value, configurable: true });
      this.update();
    }
    get template() {
      let h = 5;
      let w = h * 2;
      return `
        <svg viewBox="-1 -1 ${w + 2} ${h + 2}" width="${w + 2}" height="${h + 2}">
          <path d="M 0 ${h} L ${h} 0 L ${w} ${h}" stroke="#c0c4cc" stroke-width="1" fill="none" />
        </svg>
      `;
    }
    get styleSheet() {
      return `
        :scope {
          display: inline-block;
          vertical-align: center;
          transition: transform .3s;
          transition-origin: center;
          margin-right: 3px;
        }
      `;
    }
  }

  class Option extends Jinkela {
    get template() {
      return '<div><meta ref="children" /></div>';
    }
    get styleSheet() {
      return `
        :scope {
          font-size: 14px;
          padding: 0 20px 0 var(--indent);
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 34px;
          line-height: 34px;
          box-sizing: border-box;
          &:hover {
            background: #f5f7fa;
          }
          > span {
            display: inline-block;
            vertical-align: middle;
          }
        }
      `;
    }
  }

  class Member extends Option {
    get Checkbox() { return Checkbox; }
    get Triangle() { return Triangle; }
    get Text() { return Text; }
    get count() { return 1; }
    get selectedNum() { return this.checked; }

    get value() { return [ this.id, this.extensionObject && this.extensionObject.value ]; }

    applyConditions(test) {
      if (test(this)) {
        this.element.classList.remove('filtered');
        return true;
      } else {
        this.element.classList.add('filtered');
        return false;
      }
    }

    get extensionObject() {
      let { extension: Extension, disabled } = this;
      let value;
      if (typeof Extension === 'function') {
        value = new Extension({ disabled, member: this });
        value.element.addEventListener('change', () => {
          if (!this.checked) return;
          let detail = this.value;
          let myEvent = new CustomEvent('update', { bubbles: true, detail });
          this.element.dispatchEvent(myEvent);
        });
        value.to(this);
      }
      Object.defineProperty(this, 'extensionObject', { configurable: true, value });
      return value;
    }

    init() {
      this.native.addEventListener('click', this.select.bind(this));
    }

    update(value) {
      if (!value) return;
      let checked = !!this.checked;
      this.checked = value.has(this.id);
      if (this.checked) {
        let extensionValue = value.get(this.id);
        //  TODO: The "!==" operator is unsafe in object cases
        if (this.extensionObject && this.extensionObject.value !== extensionValue) this.extensionObject.value = extensionValue;
      } else {
        if (this.hasOwnProperty('extensionObject')) {
          this.extensionObject && this.extensionObject.element.remove();
          delete this.extensionObject;
        }
      }
    }

    select(event) {
      if (this.disabled) return;
      event.fromCheckbox = true;
      let detail = [ this.value ];
      let myEvent = new CustomEvent(this.checked ? 'remove' : 'add', { bubbles: true, detail });
      this.element.dispatchEvent(myEvent);
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    get template() {
      return `
        <div>
          <span class="native" ref="native">
            <jkl-triangle></jkl-triangle>
            <jkl-checkbox ref="checkbox" checked="{checked}" disabled="{disabled}"></jkl-checkbox>
            <span>{name}</span>
          </span>
        </div>
      `;
    }

    get styleSheet() {
      return `
        :scope {
          > .native {
            cursor: pointer;
            display: inline-block;
            vertical-align: middle;
            > .triangle { visibility: hidden; }
            > span {
              display: inline-block;
              vertical-align: middle;
            }
          }
          &.filtered { display: none; }
        }
      `;
    }
  }

  class Department extends Jinkela {
    get Checkbox() { return Checkbox; }
    get Triangle() { return Triangle; }
    get Option() { return Option; }

    get count() {
      let value = this.$subList.reduce((sum, item) => sum + item.count, 0);
      Object.defineProperty(this, 'count', { value, configurable: true });
      return value;
    }

    applyConditions(test) {
      let matches = this.$subList.reduce((sum, item) => sum + item.applyConditions(test), 0);
      if (matches) {
        this.element.classList.remove('filtered');
        return true;
      } else {
        this.element.classList.add('filtered');
        return false;
      }
    }

    get selectedNum() {
      return this.$subList.reduce((sum, item) => sum + item.selectedNum, 0);
    }

    select(event) {
      if (this.disabled) return;
      event.fromCheckbox = true;
      let detail = (function callee(what) {
        if (what.$subList) return [].concat(...what.$subList.map(callee));
        return [ what.value ];
      }(this));
      let myEvent = new CustomEvent(this.checked ? 'remove' : 'add', { bubbles: true, detail });
      this.element.dispatchEvent(myEvent);
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    preventDoubleClickSelect() {
      let timer = null;
      this.element.addEventListener('click', () => {
        if (!getSelection().isCollapsed) return;
        this.element.style.userSelect = 'none';
        clearTimeout(timer);
        timer = setTimeout(() => this.element.style.removeProperty('user-select'), 500);
      }, true);
    }

    get flatten() { return this.element.classList.contains('flatten'); }
    set flatten(value) {
      value = !!value;
      if (value === this.flatten) return;
      this.element.classList[value ? 'add' : 'remove']('flatten');
      this.$subList.forEach(item => { item.flatten = value; });
      this.update();
    }

    toggle(event) {
      if (event.fromCheckbox) return;
      this.active = !this.active;
      this.update();
    }

    get $subList() {
      let value = [];
      let { members = [], disabled, extension } = this;
      members.forEach(raw => {
        value.push(new Member(raw, { disabled, extension }));
      });
      this.departments.forEach(item => {
        value.push(new Department(item, { indent: this.indent + 20 }));
      });
      Object.defineProperty(this, '$subList', { value, configurable: true });
      return value;
    }

    update(value) {
      // TODO: transition
      if (this.active || this.flatten) {
        if (this.subList.length === 0) this.subList = this.$subList.map(item => item.to(this.list));
      } else {
        while (this.list.firstChild) this.list.firstChild.remove();
        this.subList = [];
      }
      // Broadcast value udpate
      this.$subList.forEach(item => item.update(value));
      // Update department state
      this.checked = this.$subList.every(item => item.checked);
      this.touched = this.$subList.some(item => item.checked || item.touched);
      this.selectedNumText = this.selectedNum;
    }

    init() {
      this.element.jinkela = this;
      this.preventDoubleClickSelect();
      this.list.style.setProperty('--indent', this.indent + 'px');
      this.countText = this.count;
      this.selectedNumText = this.selectedNum;
    }

    get template() {
      return `
        <div>
          <jkl-option on-click="{toggle}" class="native">
            <jkl-triangle value="{active}" false="90deg" true="180deg"></jkl-triangle>
            <jkl-checkbox
              ref="checkbox" checked="{checked}" touched="{touched}"
              on-click="{select}"
              disabled="{disabled}"
            ></jkl-checkbox>
            <span>{name}</span>
            <var>(<span>{selectedNumText}</span>/<span>{countText}</span>)</var>
          </jkl-option>
          <div class="list" ref="list"></div>
        </div>
      `;
    }

    get styleSheet() {
      return `
        :scope {
          > .native {
            cursor: pointer;
          }
          var {
            color: #909399;
            font-style: normal;
            font-size: 12px;
          }
          &.flatten {
            > :first-child { display: none; }
            > .list > * {
              --indent: 20px;
            }
          }
          &.filtered { display: none; }
        }
      `;
    }
  }

  class Tree extends Jinkela {
    get flatten() { return this.element.classList.contains('flatten'); }
    set flatten(value) {
      value = !!value;
      if (value === this.flatten) return;
      this.subList.forEach(item => { item.flatten = value; });
      this.element.classList[value ? 'add' : 'remove']('flatten');
    }

    update(value) {
      if (this.subList && value) this.subList.forEach(item => item.update(value));
    }

    applyConditions(test) {
      if (!this.subList) throw Error('WTF: Why subList cannot found now?');
      let matches = this.subList.reduce((sum, item) => sum + item.applyConditions(test), 0);
      if (matches) {
        this.element.classList.remove('empty');
        return true;
      } else {
        this.element.classList.add('empty');
        return false;
      }
    }

    init() {
      let { data, disabled, extension } = this;
      if (!(data instanceof Array)) throw new Error('MemberCollector: `data` must be an array');

      // Wrap Object
      data = data.map(({ id, parentId, name, members }) => {
        return { id, parentId, members, name, departments: [], disabled, extension };
      });

      // Build Tree
      let map = data.reduce((base, i) => { base[i.id] = i; return base; }, {});
      let root = { departments: [] };
      data.forEach(i => (map[i.parentId] || root).departments.push(i));

      // Render as children
      while (this.element.firstChild) this.element.firstChild.remove();
      this.subList = root.departments.map(item => {
        return new Department(item, { indent: 40 }).to(this);
      });
    }

    get styleSheet() {
      return `
        :scope {
          --indent: 20px;
          box-sizing: border-box;
          min-width: 240px;
          padding: 15px 0;
          max-height: var(--max-height);
          overflow: auto;
          &.empty::before {
            content: var(--empty-text);
            text-align: center;
            padding: 4px 0;
            color: #999;
            font-size: 14px;
            display: block;
          }
        }
      `;
    }
  }

  class Input extends Jinkela {
    set value(value) { this.input.value = value; }
    get value() { return this.input.value; }

    inputHandler() {
      // Debounce
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        // Build RegExp Object and bubbles with an event
        let detail;
        try {
          detail = new RegExp(this.value);
        } catch (error) {
          detail = /^/;
        }
        let event = new CustomEvent('filter', { bubbles: true, detail });
        this.element.dispatchEvent(event);
      }, 300);
    }

    get template() {
      return `
        <div>
          <svg viewBox="0 0 12 12">
            <circle cx="5" cy="5" r="4" />
            <line x1="8" y1="8" x2="11" y2="11" />
          </svg>
          <input autocomplete="off" placeholder="{placeholder}" ref="input" on-input="{inputHandler}" />
        </div>
      `;
    }
    get styleSheet() {
      return `
        :scope {
          padding: 15px;
          margin-bottom: -15px;
          position: relative;
          width: 150px;
          > svg {
            position: absolute;
            width: 12px;
            height: 12px;
            fill: none;
            stroke-width: 1px;
            stroke: #c0c4cc;
            margin: auto;
            left: 27px;
            bottom: 0;
            top: 0;
          }
          > input {
            outline: none;
            transition: border-color .2s cubic-bezier(.645,.045,.355,1);
            background-color: #fff;
            background-image: none;
            border: 1px solid #dcdfe6;
            height: 32px;
            width: 100%;
            font-size: 12px;
            display: inline-block;
            box-sizing: border-box;
            border-radius: 16px;
            padding-right: 10px;
            padding-left: 30px;
            background-color: transparent;
            &::placeholder { color: #c0c4cc; };
          }
        }
      `;
    }
  }

  class Control extends Jinkela {
    get Checkbox() { return Checkbox; }
    click() {
      this.checkbox.checked = !this.checkbox.checked;
      if (!this.key) return;
      let detail = this.checkbox.checked;
      let event = new CustomEvent(this.key, { bubbles: true, detail });
      this.element.dispatchEvent(event);
    }
    get template() {
      return `
        <span on-click="{click}">
          <jkl-checkbox ref="checkbox"></jkl-checkbox>
          <span class="desc"><meta ref="children" /></span>
        </span>
      `;
    }
    get styleSheet() {
      return `
        :scope {
          margin-left: -15px;
          padding: 15px;
          cursor: pointer;
          font-size: 12px;
          > .desc {
            margin-left: -5px;
            display: inline-block;
            vertical-align: middle;
          }
        }
      `;
    }
  }

  class MemberCollector extends Jinkela {
    // Compatible with Jinkela 1.2.*
    beforeParse({ data, disabled, extension }) {
      this.data = data;
      this.disabled = disabled;
      this.extension = extension;
    }

    get Input() { return Input; }
    get Tree() { return Tree; }
    get Control() { return Control; }

    set active(value) { this.element.classList[value ? 'add' : 'remove']('active'); }

    get placeholder() { return 'Search'; }
    get checkedOnlyText() { return 'Checked Only'; }
    get flattenText() { return 'Flatten'; }
    set maxHeight(value) { this.element.style.setProperty('--max-height', value); }
    set ['checked-only-text'](value) { this.checkedOnlyText = value; }
    get ['checked-only-text']() { return this.checkedOnlyText; }
    set ['flatten-text'](value) { this.flattenText = value; }
    get ['flatten-text']() { return this.flattenText; }
    set ['empty-text'](value) { this.element.style.setProperty('--empty-text', JSON.stringify(value)); }
    set ['max-height'](value) { this.element.style.setProperty('--max-height', JSON.stringify(value)); }

    init() {
      this.element.addEventListener('checkedonly', this.checkedOnlyHandler.bind(this));
      this.element.addEventListener('flatten', this.flattenHandler.bind(this));
      this.element.addEventListener('filter', this.filterHandler.bind(this));
      this.element.addEventListener('add', this.addHandler.bind(this));
      this.element.addEventListener('remove', this.removeHandler.bind(this));
      this.element.addEventListener('update', this.updateHandler.bind(this));
      Object.defineProperty(this, '$hasInit', { value: true, configurable: true });
      this.update();
      if (this.disabled) this.checkedOnlyControl.click();
    }

    checkedOnlyHandler(event) {
      this.checkedOnly = event.detail;
      this.applyConditions();
      event.stopPropagation();
    }

    flattenHandler(event) {
      this.tree.flatten = event.detail;
      event.stopPropagation();
    }

    filterHandler(event) {
      this.pattern = event.detail;
      this.applyConditions();
      event.stopPropagation();
    }

    updateHandler(event) {
      this.$value.set(...event.detail);
      event.stopPropagation();
    }

    addHandler(event) {
      this.value = new Map([ ...this.$value || [], ...event.detail ]);
      event.stopPropagation();
    }

    removeHandler(event) {
      let map = new Map([ ...this.$value || [] ]);
      event.detail.forEach(item => map.delete(item[0]));
      this.value = map;
      event.stopPropagation();
    }

    applyConditions() {
      let { checkedOnly, pattern = /^/ } = this;
      this.tree.applyConditions(option => {
        if (checkedOnly && !option.checked) return false;
        return pattern.test(option.name);
      });
    }

    get value() {
      let map = this.$value || new Map();
      if (this.extension) {
        // Convert js map to json map
        let result = {};
        map.forEach((value, key) => {
          result[JSON.stringify(key)] = value;
        });
        return result;
      } else {
        return [ ...map.keys() ];
      }
    }
    set value(value) {
      switch (true) {
        case value instanceof Map:
          break;
        case value instanceof Set:
          value = Array.from(value);
        case value instanceof Array: // eslint-disable-line no-fallthrough
          // Convert to js map depend on this.extension
          if (this.extension) {
            value = new Map(value);
          } else {
            value = new Map(value.map(key => [ key, void 0 ]));
          }
          break;
        case value instanceof Object:
          // Convert json map to js map
          value = Object.keys(value).reduce((base, key) => {
            base.set(JSON.parse(key), value[key]);
            return base;
          }, new Map());
          break;
        default:
          value = new Map();
      }
      Object.defineProperty(this, '$value', { configurable: true, value });
      this.update();
    }

    update() {
      if (!this.$hasInit) return;
      this.tree.update(this.$value || new Map());
    }

    get template() {
      return `
        <div>
          <div class="controls">
            <jkl-input ref="input" placeholder="{placeholder}"></jkl-input>
            <jkl-control ref="checkedOnlyControl" key="checkedonly" if="{checkedOnlyText}">{checkedOnlyText}</jkl-control>
            <jkl-control key="flatten" if="{flattenText}">{flattenText}</jkl-control>
          </div>
          <jkl-tree ref="tree" data="{data}" extension="{extension}" disabled="{disabled}"></jkl-tree>
        </div>
      `;
    }

    get styleSheet() {
      return `
        :scope {
          --empty-text: 'Empty';
          --max-height: 300px;
          -webkit-font-smoothing: antialiased;
          box-sizing: border-box;
          margin-right: 1em;
          font-size: 14px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          position: relative;
          user-select: none;
          transition: .3s;
          outline: 0;
          display: inline-block;
          flex-wrap: wrap;
          color: #606266;
          &:hover {
            border-color: #c0c4cc;
          }
          &.active {
            border: 1px solid #409eff;
          }
          > .controls {
            white-space: nowrap;
            > * {
              display: inline-block;
            }
          }
        }
      `;
    }
  }

  return MemberCollector;

});
