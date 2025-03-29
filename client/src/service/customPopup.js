import { createRoot } from "react-dom/client";

export const ShowPopup = ({
                              title = 'Error ):',
                              content = 'Something went wrong!',
                              isReloadAction = false,
                              isCloseAction = true,
                              isActionShow = true,
                              isOkAction = false,
                              type = 'error',
                              onClose = () => {},
                              onOk = () => {}
                          }) => {

    const popupModel = document.getElementById('err-popup-model');
    if (!popupModel) {
        console.error("Popup model element not found!");
        return;
    }
    const getElement = (selector) => {
        const element = popupModel.querySelector(selector);
        if(!element) {
            console.warn(`Popup element ${selector} not found!`);
        }
        return element;
    };

    const popupTitle = getElement('#responsive-popup-title');
    const popupContent = getElement('#responsive-popup-content');
    const popupReloadAction = getElement('#responsive-popup-reload');
    const popupCloseAction = getElement('#responsive-popup-close');
    const popupActions = getElement('#responsive-popup-actions');
    const popupOkAction = getElement('#responsive-popup-ok');

    if(popupContent) popupContent.innerHTML = content
    if(popupTitle) popupTitle.innerHTML = title
    if(popupOkAction) popupOkAction.style.display = isOkAction ? 'block' : 'none';
    if(popupCloseAction) popupCloseAction.style.display = isCloseAction ? 'block' : 'none';
    if(popupActions) popupActions.style.display = isActionShow ? 'flex' : 'none';
    if(popupReloadAction) popupReloadAction.style.display = isReloadAction ? 'block' : 'none';
    if(popupModel) popupModel.style.display = 'block';

    if(popupOkAction) {
        popupOkAction.onclick = () => {
            onOk();
            popupModel.style.display = 'none';
        };
    }

    if (popupCloseAction) {
        popupCloseAction.onclick = () => {
            onClose();
            popupModel.style.display = 'none';
        };
    }

    if(popupContent) {
        const root = createRoot(popupContent);
        root.render(content);
    }
}