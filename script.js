const addFont = font => document.fonts.add(font);

new FontFace('Ruda Black', 'url("fonts/Ruda Black/ruda-black.woff2")').load().then((font) => addFont(font));
new FontFace('Bebas Neue', 'url("fonts/Bebas Neue/bebas-neue.woff2")').load().then((font) => addFont(font));
new FontFace('Source Sans Pro', 'url("fonts/Source Sans Pro/source-sans-pro.woff2")').load().then((font) => addFont(font));

const fileButton = document.querySelector('.file-button');
const fileChooser = document.querySelector('.file-chooser');
const title = document.querySelector('input[name="title"]');
const price = document.querySelector('input[name="price"]');
const phone = document.querySelector('input[name="phone"]');
const city = document.querySelector('input[name="city"]');
const state = document.querySelector('input[name="state"]');
const used = document.querySelector('.used');
const accept = document.querySelector('.accept');
const buttons = document.querySelector('.buttons');
const buttonGenerate = document.querySelector('.button-generate');
const buttonView = document.querySelector('.button-view');

let canvas;
let isUsed;
let acceptExchange;
let imageWidth;
let imageHeight;
let marginTopTitle = 385;

const addEvent = ({ element = null, type, func, elems }) => {
    if (element) {
        elems ? element.addEventListener(type, () => func(elems)) : element.addEventListener(type, func);
    }
}

const isChecked = (element, checked) => {
    if (!checked) {
        return element.getElementsByTagName('input')[0].setAttribute('checked', true);
    }

    element.getElementsByTagName('input')[0].removeAttribute('checked');
}

const toggleChecked = element => {
    const checked = element.getElementsByTagName('input')[0].checked;

    isChecked(element, checked);
}

const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const customText = (context, text, x, y, lineHeight, fitWidth) => {
    let words = text.split(' ');
    let currentLine = 0;
    let idx = 1;

    while (idx <= words.length) {
        const string = words.slice(0, idx).join(' ');
        const { width } = context.measureText(string);

        if (width > fitWidth) {
            y = marginTopTitle - 60;

            if (idx === 1) {
                idx = 2;
            }

            context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));

            currentLine++;

            words = words.splice(idx - 1);

            idx = 1;
        } else {
            idx++;
        }
    }

    if  (idx > 0) {
        context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
    }
}

const load = result => {
    return new Promise((fulfill, _reject) => {
      let imageObj = new Image();

      imageObj.onload = () => fulfill(imageObj);
      imageObj.src = result;
    });
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const mask = ({ target }, func) => {
    sleep(1).then(() => {
        target.value = func(target.value);
    });
}

const regexPrice = v => {
    v = v.replace(/\D/g, ""); // Remove tudo que não é dígito

    v = v.replace(/([0-9]{2})$/g, ",$1"); // Adiciona vírgula

    if (v.length > 6) {
        v = v.replace(/(\d)(?=(\d{3})+\,)/g, "$1."); // Adiciona ponto
    }

    v = `R$ ${v}`; // Adiciona prefixo

    return v;
}

const regexPhone = v => {
    v = v.replace(/\D/g, ""); // Remove tudo que não é dígito
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); // Adiciona parênteses
    v = v.replace(/(\d)(\d{4})$/, "$1-$2"); // Adiciona hífen

    return v;
}

const resize = (originalWidth, originalHeight) => {
    if (originalWidth >= 450 && originalHeight < 583) {
        imageWidth = 450;
        imageHeight = originalHeight * (imageWidth / originalWidth);
    }

    if (originalWidth >= 450 && originalHeight >= 583) {
        imageWidth = 450;
        imageHeight = originalHeight * (imageWidth / originalWidth);
    }
}

const canvasBackground = (canvas, context, background, image) => {
    background.onload = () => {
        canvas.width = background.width;
        canvas.height = background.height;

        context.drawImage(background, 0, 0);

        context.drawImage(image, 20, 457, imageWidth, imageHeight);

        context.font = "40.80pt Ruda Black";
        context.fillStyle = "#3B4854";
        context.fillText((isUsed) ? 'USADO' : 'NOVO', 20, 170);

        context.font = "80.80pt Bebas Neue";
        context.textAlign = "center";
        context.fillStyle = "#fff";
        customText(context, title.value, canvas.width / 2, marginTopTitle, 95, 1070);

        context.font = "40.80pt Ruda Black";
        context.textAlign = "start";
        context.fillStyle = "#3B4854";
        context.fillText(price.value, (canvas.width / 2) + 20, 525);

        context.font = "40.80pt Ruda Black";
        context.textAlign = "start";
        context.fillStyle = "#3B4854";
        context.fillText((acceptExchange) ? 'Aceita troca' : 'Não aceita troca', (canvas.width / 2) + 20, 675);

        context.font = "40.80pt Ruda Black";
        context.textAlign = "start";
        context.fillStyle = "#3B4854";
        context.fillText(phone.value, (canvas.width / 2) + 20, 825);

        context.font = "bold 30pt Source Sans Pro";
        context.textAlign = "start";
        context.fillStyle = "#3B4854";
        context.fillText(capitalize(city.value), (canvas.width / 2) + 70, 955);

        context.font = "italic 25pt Source Sans Pro";
        context.textAlign = "start";
        context.fillStyle = "#3B4854";
        context.fillText(capitalize(state.value), (canvas.width / 2) + 70, 995);
    };
}

const generate = () => {
    isUsed = used.querySelector('input').checked;
    acceptExchange = accept.querySelector('input').checked;

    const file = fileChooser.files[0];

    if (file) {
        canvas = document.createElement('canvas');
        buttons.insertAdjacentElement('afterEnd', canvas);

        let context = canvas.getContext("2d");

        const reader = new FileReader();

        reader.onload = event => {
            Promise.all([
                load(event.target.result),
                load(reader.result),
              ])
              .then(images => {
                originalWidth = images[0].width;
                originalHeight = images[0].height;

                imageWidth = originalWidth;
                imageHeight = originalHeight;

                resize(originalWidth, originalHeight);

                if (imageHeight > 583) {
                    imageHeight = 583;
                    imageWidth = originalWidth * (imageHeight / originalHeight);
                }

                images[1].src = "backgrounds/default.png";

                canvasBackground(canvas, context, images[1], images[0]);
              })
        }

        reader.readAsDataURL(file);

        buttonGenerate.classList.add('hidden');
    }
}

const view = () => {
    if (canvas) {
        const base64 = document.querySelector('canvas').toDataURL("image/png", 1.0);

        document.write('<img src="'+base64+'"/>');
    }
}

addEvent({
    element: fileButton,
    type: 'click',
    func: () => fileChooser.click(),
    elems: null
});

addEvent({
    element: price,
    type: 'keyup',
    func: (event) => mask(event, regexPrice),
    elems: null
});

addEvent({
    element: phone,
    type: 'keyup',
    func: (event) => mask(event, regexPhone),
    elems: null
});

addEvent({
    element: used,
    type: 'click',
    func: toggleChecked,
    elems: used
});

addEvent({
    element: accept,
    type: 'click',
    func: toggleChecked,
    elems: accept
});

addEvent({
    element: buttonGenerate,
    type: 'click',
    func: generate,
    elems: null
});

addEvent({
    element: buttonView,
    type: 'click',
    func: view,
    elems: null
});
