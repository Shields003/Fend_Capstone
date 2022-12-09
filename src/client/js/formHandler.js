//This file contains all the functions related to the form
const savedTripsSection = document.getElementById('savedTripsSection');

document.addEventListener('DOMContentLoaded', () => {
    Client.savedTrips();
});

// This function will check local storage for any saved trips
const handleSubmit = async (event) => {
    event.preventDefault();

    const destination = document.getElementById('destination');
    const departureDate = document.getElementById('departureDate');

    const formElements = [destination, departureDate];
    const isFormValid = Client.inputValidate(formElements);
    if (!isFormValid) return;

    const tripInfo = document.getElementById('tripInfo');

    let geonameData;
    let weatherData;
    let pixabayData;

    try {
        geonameData = await Client.getGeonameInfo(destination.value);

        if (geonameData.geonames.length === 0) return;

        const lat = geonameData.geonames[0].lat;
        const lon = geonameData.geonames[0].lng;

        const daysToGo = Client.numDays(departureDate.value);

        weatherData = await Client.getWeatherBitInfo(daysToGo, lat, lon);

        pixabayData = await Client.getPixabayImages(
            'photo',
            'travel',
            true,
            'popular',
            'horizontal',
            destination.value
        );

        const projectData = {
            id: geonameData.geonames[0].geonameId,
            departureDate: departureDate.value,
            destination: destination.value,
            leavingDate: departureDate.value,
            geonameData: { ...geonameData.geonames[0] },
            weatherData: [...weatherData.data],
            pixabayData: { ...pixabayData.hits[0] },
        };

        postProjectdata('/save-search-result', projectData).then(
            async (searchResult) => {
                let destinationImage = 'images/placeholder.jpg';

                if (searchResult.pixabayData.webformatURL) {
                    destinationImage = searchResult.pixabayData.webformatURL;
                }

                const innerCard = Client.cardInfo(
                    searchResult.pixabayData.webformatURL,
                    searchResult.destination,
                    daysToGo,
                    searchResult.weatherData,
                    searchResult.id
                );

                tripInfo.innerHTML = `
                    <div class="card">
                        ${innerCard}
                    </div>
                `;
            }
        );
    } catch (error) {
        console.error(error);
    }
};

// This will check if a trip is already saved
const saveTrip = async () => {
    let savedTrips = await getSavedTrips();
    const searchResult = await getSearchResult();

    if (isTripSaved(searchResult.id, savedTrips)) {
        return;
    }

    postProjectdata('/save-trip', searchResult).then(async (savedTrip) => {
        savedTrips = await getSavedTrips();
        localStorage.setItem('savedTrips', JSON.stringify(savedTrips));

        const daysToGo = Client.numDays(savedTrip.departureDate);
        let destinationImage = savedTrip.pixabayData.webformatURL;
        if (!destinationImage) destinationImage = 'images/placeholder.jpg';

        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'card--column');

        cardElement.innerHTML = Client.cardInfo(
            destinationImage,
            savedTrip.destination,
            daysToGo,
            savedTrip.weatherData,
            savedTrip.id,
            false
        );

        savedTripsSection.prepend(cardElement);
    });
};

// This will remove a trip from local storage
const removeTrip = async (url = '/remove-saved-trip', data = {}) => {
    const parentCardElelement = event.target.closest('.card');

    const tripId = event.target.dataset.tripId;
    data = { id: tripId };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const savedTrips = await response.json();

    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));

    parentCardElelement.remove();
};

// This function will get the search result from the server
const getSearchResult = async () => {
    const response = await fetch('/get-search-result');
    const searchResult = await response.json();
    return searchResult;
};

// This function will get the saved trips from the server
const getSavedTrips = async () => {
    const response = await fetch('/get-saved-trips');
    const savedTrips = await response.json();
    return savedTrips;
};

// This function will post the search result to the server
const postProjectdata = async (url = '', data = {}) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

// This function will check if a trip is already saved
const isTripSaved = (tripToSaveID, savedTrips) => {
    if (savedTrips.length !== 0) {
        for (let trip of savedTrips) {
            if (trip.geonameData.geonameId === tripToSaveID) {
                return true;
            }
        }
        return false;
    }
};

export { handleSubmit, saveTrip, removeTrip };
