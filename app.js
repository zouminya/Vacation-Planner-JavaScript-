const mainForm = document.querySelector(".mainForm");
const itinerary = document.querySelector(".itinerary");
const cityAndDaySubForm = document.querySelector(".subForm");
const country = document.querySelector(".inputCountry");
const departureCity = document.querySelector(".inputDepartureCity");
const returnCity = document.querySelector(".inputReturnCity");
const departureDate = document.querySelector(".inputDepartureDate");
const returnDate = document.querySelector(".inputReturnDate");
const warning = document.querySelector(".warning");
const addBtn = document.querySelector(".btn--add");
const nextBtn = document.querySelector(".btn--next");
const editBtn = document.querySelector(".btn--edit");
const itineraryList = document.querySelector(".itineraryList");

let travelInfo = localStorage.getItem("travelInfo")
  ? JSON.parse(localStorage.getItem("travelInfo"))
  : [];

//add additional text fields for city and days
function addTextFieldToUI() {
  const div = document.createElement("div");
  div.className = "groupItems groupItems--margin";
  div.innerHTML = `
    <div class="textField textField--marginLeft">
    <input type="text" class="textField__input inputCity" name="city" placeholder="Enter a city"> 
    </div>
    <div class="textField">
    <input type="number" class="textField__input textField__input--short inputDays" name="days" placeholder="Days"> 
    </div>
    <span class="btn--delete"> X</span> 
    `;
  cityAndDaySubForm.appendChild(div);
}

//delete text field when click on the X
function deleteTextFieldFromUI(e) {
  if (e.target.className === "btn--delete") {
    e.target.parentElement.remove();
  }
}

//add form information to storage
function addInfoToStorage() {
  travelInfo = {
    country: country.value,
    departureCity: departureCity.value,
    returnCity: returnCity.value,
    departureDate: departureDate.value,
    returnDate: returnDate.value,
  };
  localStorage.setItem("travelInfo", JSON.stringify(travelInfo));
}

//get the single date information into an array
function getDateInfo(i) {
  let currentDate = new Date(departureDate.value);
  //need to correct for React 2 getDay to getDate*************
  currentDate.setDate(currentDate.getDate() + i);
  const options = { weekday: "short", month: "numeric", day: "numeric" };
  const date = currentDate.toLocaleTimeString("en-us", options);
  const dateArr = date.split(",");
  return dateArr;
}

//creat a new cities array for all traveling days
function getCityInfo(daysArr, cityArr) {
  let allCitiesArr = [];
  let newArr = [];
  for (let i = 0; i < daysArr.length; i++) {
    newArr = Array.from({ length: daysArr[i] }).fill(cityArr[i]);
    allCitiesArr = allCitiesArr.concat(newArr);
  }
  return allCitiesArr;
}

//gather all the date, day and city information in array to display in itinerary
function itineraryArr() {
  let totalDays;
  const citiesNodeList = [...document.querySelectorAll(".inputCity")];
  const daysNodeList = [...document.querySelectorAll(".inputDays")];
  const daysArr = daysNodeList.map((day) => parseInt(day.value));
  const cityArr = citiesNodeList.map((city) => city.value);
  const numDaysArr = daysArr.map((day) => parseInt(day));
  if (daysArr.length === 1) {
    totalDays = numDaysArr[0];
  } else {
    totalDays = numDaysArr.reduce((a, b) => a + b, 0);
  }
  let listArr = [];

  for (let i = 0; i < totalDays; i++) {
    listArr.push({
      day: getDateInfo(i)[0],
      date: getDateInfo(i)[1],
      city: getCityInfo(numDaysArr, cityArr)[i],
    });
  }
  const fullCityArr = getCityInfo(numDaysArr, cityArr);
  return { listArr, numDaysArr, fullCityArr };
}

//display itinerary element
function showItineraryElement(info) {
  return `
    <div class="scheduleItem">
     <div class="circle">
       <span class="circle__day">${info.day}</span>
       <span class="circle__date">${info.date}</span>
      </div> 
      <h3 class="scheduleItem__info">${info.city}</h3>
      </div>
     `;
}

function showItinerary() {
  const data = JSON.parse(localStorage.getItem("travelInfo"));
  const { departureCity, returnCity } = data;
  const { listArr, numDaysArr, fullCityArr } = itineraryArr();

  //change the first and last day city information with departure city and return city
  listArr[0].city = `${departureCity} <i class="fas fa-arrow-right"></i> ${listArr[0].city}`;
  listArr[listArr.length - 1].city = `${
    listArr[listArr.length - 1].city
  } <i class="fas fa-arrow-right"></i> ${returnCity}`;

  //adding info for previous city to next city
  let tempDays = 0;
  for (let j = 0; j < numDaysArr.length - 1; j++) {
    tempDays += numDaysArr[j];
    const cityInfo = `${
      fullCityArr[tempDays - 1]
    } <i class="fas fa-arrow-right"></i> ${fullCityArr[tempDays]}`;
    listArr[tempDays].city = cityInfo;
  }
  itineraryList.innerHTML = `
 ${listArr.map((info) => `${showItineraryElement(info)}`).join("")}
`;
}

//calculate the days between 2 giving dates
function differenceInDays(departureDate, returnDate) {
  const departureDay = new Date(departureDate);
  const returnDay = new Date(returnDate);
  const differenceInTime = returnDay.getTime() - departureDay.getTime();
  const planingDays = differenceInTime / (1000 * 3600 * 24) + 1;
  return planingDays;
}

//setTimeout function that return the original message
function timeOut() {
  setTimeout(() => {
    warning.innerHTML =
      '<small class="smallText">*</small> All the fields need to be filled';
    warning.className = "warning";
  }, 4000);
}

//click on the next button, and show itinerary page
function submitHandler() {
  const citiesNodeList = [...document.querySelectorAll(".inputCity")];
  const daysNodeList = [...document.querySelectorAll(".inputDays")];
  const daysArr = daysNodeList.map((day) => parseInt(day.value));
  const cityArr = citiesNodeList.map((city) => city.value);
  const planningDays = differenceInDays(departureDate.value, returnDate.value);
  let travelDays;
  if (daysArr.length === 1) {
    travelDays = daysArr[0];
  } else {
    travelDays = daysArr.reduce((a, b) => a + b, 0);
  }

  if (planningDays > travelDays) {
    warning.textContent = "More Days/Places To Plan";
    warning.className = "red";
    timeOut();
  }

  if (planningDays < travelDays) {
    warning.textContent = "Plan For Too Many Days, Need To Shrink Your Plan";
    warning.className = "red";
    timeOut();
  }

  if (
    departureDate.value &&
    returnCity.value &&
    departureDate.value &&
    returnDate.value &&
    cityArr.length !== 0 &&
    daysArr.length !== 0 &&
    planningDays === travelDays
  ) {
    mainForm.classList = "mainForm container hideForm";
    itinerary.classList =
      "itinerary showItinerary container container--itinerary";
    addInfoToStorage();
    showItinerary();
  }
}

// click on the edit button and return to the previous form
function editItinerary() {
  mainForm.classList.remove("hideForm");
  itinerary.classList.remove("showItinerary");
  mainForm.style.transfer = "translateY(50%)";
}

//dom events
addBtn.addEventListener("click", addTextFieldToUI);
cityAndDaySubForm.addEventListener("click", deleteTextFieldFromUI);
nextBtn.addEventListener("click", submitHandler);
editBtn.addEventListener("click", editItinerary);
