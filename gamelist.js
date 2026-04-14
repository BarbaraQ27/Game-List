
const API_URL = `https://api.rawg.io/api/games?key=${API_KEY}&dates=2019-09-01,2026-03-03&ordering=-added&page_size=35`
const HTMLResponse = document.getElementById("games-container");
const container = document.getElementById("games-container");


//////////////////////////////////////
const cards = document.getElementById("cards")
const items = document.getElementById("items")
const templateCard = document.getElementById("template-card").content
const templateMyList = document.getElementById("template-myList").content
const fragment = document.createDocumentFragment()
let gameList = {} //array donde se guardaran las cards


document.addEventListener("DOMContentLoaded", () => {
  fetchData()
  if (localStorage.getItem('gameList')) {
    gameList = JSON.parse(localStorage.getItem('gameList'));
    myList()
  }
});

cards.addEventListener('click', e => {  //e para capturar el elemento a modificar
  addGames(e)
})
items.addEventListener('click', e => {
  btnDelete(e)
})

//funcion para fetch data de busqueda
document.getElementById("searchBtn").addEventListener("click", gameSearch);

async function gameSearch() {
  try {
    //definicion de variables 
    const gameName = document.getElementById("gameName").value.toLowerCase();

    const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&search=${gameName}`);
    if (!response.ok) { //si es falso
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    //console.log(data) // esto es para buscar algun dato en especifico de la lista
    const noResults = document.getElementById("noResults");
    const games = data.results;
    cards.innerHTML = "";

    if (games.length === 0) {
      noResults.style.display = "block";
    } else {
      gameCards(data)
    }
  }
  catch (error) {
    console.error("Error fetching data:", error);
  };
}


//Fetch los datos de la API para crear una lista con cards
const fetchData = async () => {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    gameCards(data)
  } catch (error) {
    console.log(error)
  }
}

//Objener y ordenar las plataformas 
const getPlatformStr = (platforms) => {
  const platformStr = platforms.map(pl => pl.platform.name).join(", ");
  return platformStr;
}

//Creacion de tarjetas para cada resultado del fetch
const gameCards = data => {
  const games = data.results;
  games.forEach(game => {
    templateCard.querySelector('h5').textContent = game.name
    templateCard.querySelector('p').textContent = getPlatformStr(game.parent_platforms)
    templateCard.querySelector('img').setAttribute("src", game.background_image)
    templateCard.querySelector('.btn-add').dataset.slug = game.slug

    const clone = templateCard.cloneNode(true)
    fragment.appendChild(clone)

  });
  cards.appendChild(fragment) //donde se va a mostrar en el HTML
};

//Funcion para anadir juegos
const addGames = e => {
  //console.log(e.target.classList.contains('btn-add')) //para verificar si solo presionar sobre el boton envia true
  if (e.target.classList.contains('btn-add')) {
    setGameList(e.target.parentElement) //para traer todo el div del boton presionado
  }
  e.stopPropagation() // detener cualquier otro evento desde el contenedor padre
}

const setGameList = object => {
  //console.log(object)
  const game = {
    slug: object.querySelector('.btn-add').dataset.slug,
    name: object.querySelector('h5').textContent,
    platforms: object.querySelector('p').textContent,
    image: object.querySelector('img').src, //para seleccionar solo la fuente de la imagen
    qty: 1
  }

  gameList[game.slug] = { ...game }
  myList()
  //console.log(gameList) //para revisar el objeto seleccionado con el boton
}

//Lo que incluira el array de objetos
const myList = () => {
  items.innerHTML = ''
  Object.values(gameList).forEach(item => {
    //templateMyList.querySelector('th').textContent = item.slug
    templateMyList.querySelector('img').setAttribute("src", item.image)
    templateMyList.querySelectorAll('th')[0].textContent = item.qty//accede desde su primer elemento
    templateMyList.querySelectorAll('th')[1].textContent = item.name
    templateMyList.querySelectorAll('th')[2].textContent = item.platforms
    templateMyList.querySelector('.btn-status').dataset.slug = item.slug
    templateMyList.querySelector('.btn-delete').dataset.slug = item.slug
    const clone = templateMyList.cloneNode(true)
    fragment.appendChild(clone)
  });
  items.appendChild(fragment);

  localStorage.setItem('gameList', JSON.stringify(gameList));
}

//Funcion borrar de la lista 
const btnDelete = e => {
  if (e.target.classList.contains('btn-delete')) {
    // console.log(gameList[e.target.dataset.slug])
    const game = gameList[e.target.dataset.slug]
    game.qty--
    if (game.qty === 0) {
      delete gameList[e.target.dataset.slug]
    }
    myList()
  }
  e.stopPropagation()
}

//Funcion cambiar el estatus (toggle)
//POR DETERMINAR EL ENVIO A LOCALSTORAGE...
function changeStatus(e) {
  let txt = e.innerText;
  e.innerText = txt == 'PENDING' ? 'COMPLETE' : 'PENDING';
}