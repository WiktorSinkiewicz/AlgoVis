class Renderer {
  constructor({ scene, codeBlock, logPanel }) {
    this.scene = scene;
    this.codeBlock = codeBlock;
    this.logPanel = logPanel;
    this.svgLayer = null;

    this.handlers = {
      init_code:       (cmd) => this.initCode(cmd),
      init_array:      (cmd) => this.initArray(cmd),
      init_graph:      (cmd) => this.initGraph(cmd),
      log:             (cmd) => this.addLog(cmd.text),
      highlight_line:  (cmd) => this.highlightLine(cmd.line),
      set_bar_color:   (cmd) => this.setBarColor(cmd.index, cmd.color),
      set_bar_active:  (cmd) => this.setBarActive(cmd.index, cmd.active),
      set_node_color:  (cmd) => this.setNodeColor(cmd.id, cmd.color),
      set_node_active: (cmd) => this.setNodeActive(cmd.id, cmd.active),
      swap:            (cmd) => this.swapBars(cmd.index1, cmd.index2),
    };
  }

  execute(command) {
    const handler = this.handlers[command.action];
    if (handler) {
      handler(command);
    } else {
      console.warn(`Unknown command: "${command.action}"`);
    }
  }

  registerHandler(actionName, fn) {
    this.handlers[actionName] = fn;
  }

  reset() {
    this.scene.innerHTML = '';
    this.codeBlock.innerHTML = '';
    this.svgLayer = null;
    this.logPanel.innerHTML = '<span class="log-placeholder">Load a trace file to begin...</span>';
  }

  // ── Command handlers ──────────────────────────────

  initCode({ lines }) {
    this.codeBlock.innerHTML = '';
    lines.forEach((text, i) => {
      const span = document.createElement('span');
      span.className = 'code-line';
      span.id = `line-${i + 1}`;
      span.dataset.line = i + 1;
      span.textContent = text || ' ';
      this.codeBlock.appendChild(span);
    });
  }

  initArray({ data }) {
    this.scene.innerHTML = '';
    this.scene.style.cssText = 'display:flex; align-items:flex-end; justify-content:center; gap:8px; padding:32px 32px 40px;';

    const max = Math.max(...data);
    data.forEach((value, index) => {
      const bar = document.createElement('div');
      bar.className = 'array-bar';
      bar.id = `bar-${index}`;
      bar.style.height = `${Math.max(28, (value / max) * 320)}px`;
      bar.style.background = 'var(--bar-default)';
      bar.textContent = value;
      this.scene.appendChild(bar);
    });
  }

  initGraph({ nodes, edges }) {
    this.scene.innerHTML = '';
    this.scene.style.cssText = 'display:block; padding:0;';

    this.svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.scene.appendChild(this.svgLayer);

    for (const from in edges) {
      edges[from].forEach(to => {
        const a = nodes[from];
        const b = nodes[to];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x + 22);
        line.setAttribute('y1', a.y + 22);
        line.setAttribute('x2', b.x + 22);
        line.setAttribute('y2', b.y + 22);
        this.svgLayer.appendChild(line);
      });
    }

    for (const id in nodes) {
      const { x, y } = nodes[id];
      const node = document.createElement('div');
      node.className = 'node';
      node.id = `node-${id}`;
      node.style.left = `${x}px`;
      node.style.top  = `${y}px`;
      node.textContent = id;
      this.scene.appendChild(node);
    }
  }

  addLog(text) {
    const placeholder = this.logPanel.querySelector('.log-placeholder');
    if (placeholder) placeholder.remove();

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = text;
    this.logPanel.appendChild(entry);
    this.logPanel.scrollTop = this.logPanel.scrollHeight;
  }

  highlightLine(lineNumber) {
    this.codeBlock.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
    if (lineNumber > 0) {
      const el = document.getElementById(`line-${lineNumber}`);
      if (el) {
        el.classList.add('highlighted');
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  setBarColor(index, color) {
    const bar = document.getElementById(`bar-${index}`);
    if (bar) bar.style.background = color;
  }

  setBarActive(index, active) {
    const bar = document.getElementById(`bar-${index}`);
    if (bar) bar.classList.toggle('active', active);
  }

  setNodeColor(id, color) {
    const node = document.getElementById(`node-${id}`);
    if (node) node.style.background = color;
  }

  setNodeActive(id, active) {
    if (active) {
      this.scene.querySelectorAll('.node.active').forEach(n => n.classList.remove('active'));
    }
    const node = document.getElementById(`node-${id}`);
    if (node) node.classList.toggle('active', active);
  }

  swapBars(i1, i2) {
    const a = document.getElementById(`bar-${i1}`);
    const b = document.getElementById(`bar-${i2}`);
    if (!a || !b) return;
    [a.style.height, b.style.height] = [b.style.height, a.style.height];
    [a.textContent, b.textContent] = [b.textContent, a.textContent];
  }
}