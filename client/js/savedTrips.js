// This function will check local storage for any saved trips
// Then render any trips to the UI using the cardInfo function
const savedTrips = () => {
    // Retrieve the object from storage
    const localStorageSavedTrips = JSON.parse(
        localStorage.getItem('savedTrips')
    );

    if (localStorageSavedTrips != null) {
        let documentFragment = new DocumentFragment();
        for (let localStorageSavedTrip of localStorageSavedTrips) {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'card--column');

            // Calcuate the number of days to go
            const daysToGo = Client.numDays(
                localStorageSavedTrip.departureDate
            );

            cardElement.innerHTML = Client.cardInfo(
                localStorageSavedTrip.pixabayData.webformatURL,
                localStorageSavedTrip.destination,
                daysToGo,
                localStorageSavedTrip.weatherData,
                localStorageSavedTrip.id,
                false
            );

            documentFragment.appendChild(cardElement);
        }
        savedTripsSection.appendChild(documentFragment);
    }
};

export { savedTrips };
