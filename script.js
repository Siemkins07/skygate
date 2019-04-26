const countries = ['France', 'Germany', 'Poland', 'Spain'];
let alreadyFilled = false;
let dialog = document.querySelector(".dialog");
let input = document.querySelector('.input');
const close = document.querySelector('.close');

initDialog = () => {
    clearDialog();
    addDivsToParent(dialog, countries);
}

addDivsToParent = (parent, strings) => {
    for (let i = 0; i < strings.length; i++) {
        const row = document.createElement('div');
        row.textContent = strings[i];
        row.addEventListener('click', (e) => {
            input.value = e.target.textContent;
            input.focus();
            close.classList.add('visible');
            alreadyFilled = true;
        })
        parent.appendChild(row);
    }
};

clearDialog = () => {
    while (dialog.firstChild) {
        dialog.removeChild(dialog.firstChild);
    }
};

matchResults = (str) => {
    str = str.toLowerCase();
    clearDialog();
    const filteredCountries = countries.filter(country => country.toLocaleLowerCase().startsWith(str));
    addDivsToParent(dialog, filteredCountries);
};

input.addEventListener('click', () => {
    if (!alreadyFilled) {
        dialog.classList.add('open');
    }
});

input.addEventListener('input', (e) => {
    dialog.classList.add('open');
    alreadyFilled = false;
    const value = e.target.value;
    matchResults(value);
    if (value == "") {
        close.classList.remove('visible');
    }
});

close.addEventListener('click', () => {
    alreadyFilled = false;
    dialog.classList.add('open');
    input.value = '';
    input.focus();
    close.classList.remove('visible');
    ul = document.querySelector('ul');
    h4 = document.querySelector('h4');
    ul.textContent = '';
    h4.textContent = '';

});

document.body.addEventListener('click', (e) => {
    if (!(e.target == input || e.target == close)) {
        dialog.classList.remove('open');
    }
})

initDialog();
const btn = document.querySelector('button');
btn.addEventListener('click', () => {
    if (input.value == '') {
        alert("First select country");
    } else {
        let code = '';
        switch (input.value) {
            case "France":
                code = "FR"
                break;
            case "Germany":
                code = "DE"
                break;
            case "Poland":
                code = "PL"
                break;
            case "Spain":
                code = "ES"
                break;
        }

        fetch(`https://api.openaq.org/v1/latest?country=${code}&order_by=measurements[0].value&parameter=pm10&sort=desc&limit=2000`)
            .then(response => response.json())
            .then(response => {
                const results = response.results.map(result => result.city);
                const filtredCities = [results[0]];

                for (let i = 1; filtredCities.length < 10; i++) {
                    filtredCities.includes(results[i]);
                    if (!filtredCities.includes(results[i])) {
                        filtredCities.push(results[i]);
                    }
                }
                renderCities(filtredCities, code);
            })
    }
})

renderCities = (cities, code) => {
    const ul = document.querySelector('ul');
    ul.textContent = '';
    const h4 = document.querySelector('h4');
    h4.textContent = 'Click below on city name to read more info'
    cities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        ul.appendChild(li);
        li.appendChild(document.createElement('p'));
        li.addEventListener('click', (e) => {
            let cityDescription = e.target.textContent;
            let descParagraph = li.firstElementChild;

            if (descParagraph.textContent == '') {
                fetch(`https://${code}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&exsectionformat=plain&rvprop=content&format=json&origin=*&titles=${cityDescription}`)
                    .then(response => {
                        if (response.ok) {
                            return response;
                        }
                        throw Error(response.status);
                    })
                    .then(response => response.json())
                    .then(response => {
                        let page = response.query.pages;
                        let pageId = Object.keys(page)[0];
                        let content = page[pageId].extract;
                        descParagraph.textContent = content;
                        const strippedContent = content.replace(/(<([^>]+)>)/ig, "");
                        // descParagraph.textContent = strippedContent;
                        // descParagraph.classList.toggle('shown');
                        return strippedContent;
                    })
                    .catch(error =>
                        descParagraph.textContent = `There is nothing more to show. Try to check another city.`)
                    .then(result =>
                        descParagraph.classList.toggle('shown'))

            } else {
                descParagraph.classList.toggle('shown')
            };
            //     // localStorage.setItem("cityDescription", "30")

        });
    });
};