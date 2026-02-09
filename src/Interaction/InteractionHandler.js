export class InteractionHandler {
    constructor(elements, state, onUpdate) {
        this.elements = elements;
        this.state = state;
        this.onUpdate = onUpdate;
        this._init();
    }

    _init() {
        const { viewport } = this.elements;
        viewport.onwheel = e => {
            if (e.target.closest('#config-panel')) return;
            e.preventDefault();
            this.zoom(Math.pow(1.1, -e.deltaY / 100), e.clientX, e.clientY);
        };

        viewport.onmousedown = e => {
            if (e.target.closest('#config-panel') || e.target.closest('.grad-stop')) return;
            this.state.isDragging = true;
            this.state.startX = e.clientX - this.state.x;
            this.state.startY = e.clientY - this.state.y;
            viewport.style.cursor = 'grabbing';
        };

        window.onmousemove = e => {
            if (!this.state.isDragging) return;
            this.state.x = e.clientX - this.state.startX;
            this.state.y = e.clientY - this.state.startY;
            this.onUpdate();
        };

        window.onmouseup = () => {
            this.state.isDragging = false;
            viewport.style.cursor = 'grab';
        };
    }

    zoom(factor, mX, mY) {
        const rect = this.elements.viewport.getBoundingClientRect();
        const mouseX = mX - rect.left; const mouseY = mY - rect.top;
        const newScale = Math.min(Math.max(this.state.scale * factor, 0.1), 3);
        this.state.x = mouseX - (mouseX - this.state.x) * (newScale / this.state.scale);
        this.state.y = mouseY - (mouseY - this.state.y) * (newScale / this.state.scale);
        this.state.scale = newScale;
        this.onUpdate();
    }
}