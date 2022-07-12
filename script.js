const sections = [...document.querySelectorAll(".content-section")]// node liste retournée par querySelectionAll et qui est modifiée en tableau (pour la praticité de utilisation et fonctionnalitées) grâce au code opérateur '...' de tous les éléments de la classe content-section
const navLinks = [...document.querySelectorAll("nav a")]// node liste retournée par querySelectionAll et qui est modifiée en tableau de tous les éléments 'a' de la 'nav'
const documentationContainer = document.querySelector(".documentation-content")//pour utilisation de intersection observer


window.addEventListener("load", () => {// une fois que tous les éléments de la page ont été chargés (load), 
    let data = sections.map(section => section.offsetTop)//on stocke pour chaque section le décalage (propriété 'offsetTop') par rapport au premier ancêtre positionné (ou body si pas d'ancêtre comme c'est le cas ici). on utilise la méthode 'map' pour créer un nouveau tableau de correspondance entre les sections et leur position sur la page (peut varier selon la taille d'écran et de fenêtre d'affichage).
    console.log(data);//affiche dans la console des positions de sections

    // ------Resize Observer------ \\
    // pour gérer un changement de taille de fenêtre et donc une nouvelle position des sections
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(documentationContainer)

    let firstLoad = true;//initialisation de la variable à vrai pour ne pas entrer une première fois dans la formule et ne pas faire un calcul pour rien dès le départ
    function handleResize() {//fonction call back
        if (!firstLoad) data = sections.map(section => section.offsetTop)//actualisation des valeurs
        firstLoad = false;//reaffection de la valeur en faux pour permettre un resize à chaque changement
    }

    // ------Intersection Observer------ \\
    // optimisation des performances en gérant le déclenchement de l'évènement pour éviter du calcul inutile qui peut être couteux sur des pages lourdes/longues
    const intersectionObserver = new IntersectionObserver(startWatching, { rootMargin: "10% 0px" })
    intersectionObserver.observe(documentationContainer)

    function startWatching(entries) {
        if (entries[0].isIntersecting) {//si le container est entré dans la fenêtre
            window.addEventListener("scroll", handleScroll)//alors on ajoute un addEventListener 'scroll' qui déclenche la fonction handleScroll
        } else if (!entries[0].isIntersecting) {//sinon 
            const elToClean = navLinks.find(navLink => navLink.className.includes("marked"))//on trouve l'élément à nettoyer
            if (elToClean) elToClean.classList.remove("marked")//on enlève la classe 'marked' à l'élément
            savedIndex = undefined;//on reinitialise la postition de section stockée
            window.removeEventListener('scroll', handleScroll)//on enlève le EventListener sur la fenêtre
        }
    }

    // ------smooth scroll------ \\
    navLinks.forEach((navLink, index) => {
        navLink.addEventListener("click", e => {
            // suppression du comportement par défaut du clic sur le lien
            e.preventDefault()

            // ajout du nouveau comportement souhaité : smooth scroll = scroll doux
            window.scrollTo({//propriété pour me déplacer à un certain endroit selon les propriétés de l'objet envoyé
                top: data[index],//endroit où je veux aller
                behavior: "smooth"
            })
        })
    })

    // ------affichage de position au scroll------ \\
    //gestion des conditions d'ajout de propriétés css sur les liens de la barre de nav

    // window.addEventListener("scroll", handleScroll)//n'est plus nécessaire car on a codé la fonctionnalité avec IntersectionObserver

    let savedIndex;
    function handleScroll() {
        const trigger = window.scrollY + (window.innerHeight / 2)//déclenchement de l'évènement à partir du moment où le scroll est à la moitié de la fenêtre

        for (const i of data) {
            const index = data.indexOf(i)

            if (trigger >= data[index] && trigger < data[index + 1]) {//déterminer dans quel interval de section je me trouve
                if (index !== savedIndex) {
                    savedIndex = index;//sauvegarde de la position déjà activée pour ne pas avoir à recalculer à chaque fois
                    addClassAndClear(index)
                }
                break;//pour sortir de la boucle si la condition est remplie. on n'utilise pas inutlement de la ressource 
            }

            if (index === data.length - 1 && trigger >= data[index]) {//condition pour gérer le dernier élément de section. on gère si l'index est bien le dernier de la liste, et qu'on est positionné de manière supérieur à la dernière valeur de position de section
                if (index !== savedIndex) {
                    savedIndex = index;
                    addClassAndClear(index)
                }
            }
        }
    }

    handleScroll()//appeler cette fonction permet d'initialiser le premier lien quand on arrive sur le site

    //gestion de la reinitialisation des propriétés de css sur les liens de la nav, une fois l'évènement fini pour permettre ou non, un nouveau déclenchement
    function addClassAndClear(index) {
        const elToClean = navLinks.find(navLink => navLink.className.includes("marked"))//méthode 'find' cherche si l'élément est déjà retourné
        if (elToClean) elToClean.classList.remove("marked")//s'il est déjà retourné, alors on enlève la classe 'marked'pour ne pas refaire tourner la fonction handleScroll inutilement tant qu'on est dans la même section
        navLinks[index].classList.add("marked")//sinon on ajoute l'animation à l'index qu'on a envoyé
    }
})