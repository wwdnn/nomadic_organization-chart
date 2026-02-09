import { UIFactory } from '../Renderer/UIFactory.js';

export class SidebarManager {
    constructor(elements, settings, callbacks) {
        this.elements = elements;
        this.settings = settings;
        this.onUpdate = callbacks.onUpdate;
        this.onRefreshUI = callbacks.onRefreshUI;
        this.activeDraggingStop = null;
    }

    populate() {
        const container = this.elements.colorControls;
        container.innerHTML = '';

        Object.keys(this.settings).forEach(level => {
            const cfg = this.settings[level];
            const div = UIFactory.createLevelEditor(level, cfg);
            this._bindEditorEvents(div, level, cfg);
            container.appendChild(div);
        });
    }

    _bindEditorEvents(div, level, cfg) {
        const cp = div.querySelector('.color-pick');
        const tv = div.querySelector('.track-visual');
        const angleInput = div.querySelector('.angle-input');
        const delBtn = div.querySelector('.btn-del-stop');

        cp.value = cfg.stops[cfg.activeStopIndex || 0]?.color || "#ffffff";
        
        cp.oninput = (e) => {
            cfg.stops[cfg.activeStopIndex || 0].color = e.target.value;
            const stopPoint = div.querySelector(`.grad-stop[data-index="${cfg.activeStopIndex || 0}"]`);
            if (stopPoint) stopPoint.style.background = e.target.value;
            tv.style.background = `linear-gradient(90deg, ${cfg.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
            this.onUpdate(); 
        };

        angleInput.oninput = (e) => {
            cfg.angle = parseInt(e.target.value) || 0;
            div.querySelector('.needle').style.transform = `translate(0, -50%) rotate(${cfg.angle - 90}deg)`;
            this.onUpdate();
        };

        delBtn.onclick = () => {
            if (cfg.stops.length > 2) {
                cfg.stops.splice(cfg.activeStopIndex || 0, 1);
                cfg.activeStopIndex = 0;
                this.onRefreshUI();
                this.onUpdate();
            }
        };
    }

    handleMouseDown(e) {
        const stopEl = e.target.closest('.grad-stop');
        const trackEl = e.target.closest('.grad-track');
        const wheelEl = e.target.closest('.angle-wheel');

        if (stopEl) {
            e.stopPropagation();
            const level = stopEl.dataset.level;
            const index = parseInt(stopEl.dataset.index);
            this.activeDraggingStop = { level, index };
            this.settings[level].activeStopIndex = index;
            
            const picker = this.elements.panel.querySelector(`.color-pick[data-level="${level}"]`);
            if (picker) picker.value = this.settings[level].stops[index].color;
            return true;
        }

        if (trackEl) {
            e.stopPropagation();
            const rect = trackEl.getBoundingClientRect();
            const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const level = trackEl.dataset.level;
            this.settings[level].stops.push({ color: "#ffffff", pos: pos });
            this.settings[level].stops.sort((a, b) => a.pos - b.pos);
            this.onRefreshUI();
            this.onUpdate();
            return true;
        }

        if (wheelEl) {
            e.stopPropagation();
            this._updateAngleFromMouse(e, wheelEl);
            return true;
        }
        return false;
    }

    handleMouseMove(e) {
        if (!this.activeDraggingStop) return false;

        const { level, index } = this.activeDraggingStop;
        const track = this.elements.panel.querySelector(`.grad-track[data-level="${level}"]`);
        const rect = track.getBoundingClientRect();
        
        let pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        pos = Math.max(0, Math.min(100, pos));
        
        this.settings[level].stops[index].pos = pos;
        
        const stopUI = track.querySelector(`.grad-stop[data-index="${index}"]`);
        if (stopUI) stopUI.style.left = pos + "%";
        
        const tv = track.querySelector('.track-visual');
        tv.style.background = `linear-gradient(90deg, ${this.settings[level].stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
        
        this.onUpdate();
        return true;
    }

    handleMouseUp() {
        if (this.activeDraggingStop) {
            const { level } = this.activeDraggingStop;
            this.settings[level].stops.sort((a, b) => a.pos - b.pos);
            this.activeDraggingStop = null;
            this.onRefreshUI();
        }
    }

    _updateAngleFromMouse(e, wheelEl) {
        const rect = wheelEl.getBoundingClientRect();
        const level = wheelEl.dataset.level;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const finalAngle = Math.round(angle + 90);
        
        this.settings[level].angle = finalAngle;
        wheelEl.querySelector('.needle').style.transform = `translate(0, -50%) rotate(${finalAngle - 90}deg)`;
        
        const input = this.elements.panel.querySelector(`.angle-input[data-level="${level}"]`);
        if (input) input.value = finalAngle;
        
        this.onUpdate();
    }
}