import {insertText} from "../sv/insertText";
import {getEventName} from "../util/compatibility";
import {getEditorRange, insertHTML, setSelectionFocus} from "../util/selection";
import {MenuItem} from "./MenuItem";
import {toggleSubMenu} from "./setToolbar";

export class Emoji extends MenuItem {
    public element: HTMLElement;

    constructor(vditor: IVditor, menuItem: IMenuItem) {
        super(vditor, menuItem);
        const panelElement = document.createElement("div");
        panelElement.className = "vditor-panel vditor-panel--arrow";

        let commonEmojiHTML = "";
        Object.keys(vditor.options.hint.emoji).forEach((key) => {
            const emojiValue = vditor.options.hint.emoji[key];
            if (emojiValue.indexOf(".") > -1) {
                commonEmojiHTML += `<button data-value=":${key}: " data-key=":${key}:"><img
data-value=":${key}: " data-key=":${key}:" class="vditor-emojis__icon" src="${emojiValue}"/></button>`;
            } else {
                commonEmojiHTML += `<button data-value="${emojiValue} "
 data-key="${key}"><span class="vditor-emojis__icon">${emojiValue}</span></button>`;
            }
        });

        const tailHTML = `<div class="vditor-emojis__tail">
    <span class="vditor-emojis__tip"></span><span>${vditor.options.hint.emojiTail || ""}</span>
</div>`;

        panelElement.innerHTML = `<div class="vditor-emojis" style="max-height: ${
            vditor.options.height === "auto" ? "auto" : vditor.options.height as number - 80
        }px">${commonEmojiHTML}</div>${tailHTML}`;

        this.element.appendChild(panelElement);

        toggleSubMenu(vditor, panelElement, this.element.children[0], menuItem.level);
        this._bindEvent(vditor, panelElement);
    }

    public _bindEvent(vditor: IVditor, panelElement: HTMLElement) {
        panelElement.querySelectorAll(".vditor-emojis button").forEach((element: HTMLElement) => {
            element.addEventListener(getEventName(), (event: Event) => {
                event.preventDefault();
                const value = element.getAttribute("data-value");
                if (vditor.currentMode === "sv") {
                    insertText(vditor, value, "", true);
                } else {
                    let range;
                    let html = "";
                    if (vditor.currentMode === "wysiwyg") {
                        range = getEditorRange(vditor.wysiwyg.element);
                        html = vditor.lute.SpinVditorDOM(value);
                    } else if (vditor.currentMode === "ir") {
                        range = getEditorRange(vditor.ir.element);
                        html = vditor.lute.SpinVditorIRDOM(value);
                    }
                    if (value.indexOf(":") > -1) {
                        const tempElement = document.createElement("div");
                        tempElement.innerHTML = html;
                        html = tempElement.firstElementChild.firstElementChild.outerHTML + " ";
                        insertHTML(html, vditor);
                    } else {
                        range.insertNode(document.createTextNode(value));
                    }
                    range.collapse(false);
                    setSelectionFocus(range);
                }

                panelElement.style.display = "none";
            });
            element.addEventListener("mouseover", (event: Event) => {
                if ((event.target as HTMLElement).tagName === "BUTTON") {
                    panelElement.querySelector(".vditor-emojis__tip").innerHTML =
                        (event.target as HTMLElement).getAttribute("data-key");
                }
            });
        });
    }
}
