//.document refers to all the html tags within the elements tab
const canvas = document.querySelector('canvas')

//We need to select our canvas context: Our canvas api that allows us to draw on the canvas 
const context = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modelEl = document.querySelector('#modelEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

//First thing we need to do is create a player
//Creating a class for our player since it will be interavtive
class Player {
        constructor(x, y, radius, color){
            //properties each new player SHOULD have
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
        }

        //draw function
        draw(){
            context.beginPath()
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            //this helps declare the color we want
            context.fillStyle = this.color
            context.fill()
        }
}

//Creating class for projectiles
class Projectile {
    constructor(x, y, radius, color, velocity){
        //properties each new projectile SHOULD have
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
     //Define what our projectiles should look like 
     //draw function
     draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        //this helps declare the color we want
        context.fillStyle = this.color
        context.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

//Creating class for enemies
class Enemy {
    constructor(x, y, radius, color, velocity){
        //properties each new projectile SHOULD have
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
     //Define what our projectiles should look like 
     //draw function
     draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        //this helps declare the color we want
        context.fillStyle = this.color
        context.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99

//Creating class for particles
class Particle {
    constructor(x, y, radius, color, velocity){
        //properties each new projectile SHOULD have
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1 //makes particle fade out over time
    }
     //Define what our projectiles should look like 
     //draw function
     draw(){
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        //this helps declare the color we want
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

//Trying to get circle in center of html
const x = canvas.width / 2
const y = canvas.height / 2

//Creating new player ==== new instance 
let player = new Player(x, y, 10, 'white')

//Creating array for projectiles movements
//Loop through all of our projectiles within animate loop --- managment instances of the same object
let projectiles = []
let enemies = []
let particles = []

//reset all of our scores 
function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4 //makes sure to get value from 4 to 30
        let x
        let y

        if(Math.random() < 0.5 ) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius //if its less than 0.5 we assign it if not we call second value
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
         
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)` //making enemy color random
       
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 -x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

//Animation loop to make projectiles move
let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    context.fillStyle = 'rgba(0, 0, 0, 0.1)' //alpha value gives particles a fade effect
    context.fillRect(0, 0, canvas.width, canvas.height)
    player.draw() //calling draw function
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
        particle.update()
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        if(projectile.x + projectile.radius < 0 || 
           projectile.x - projectile.radius > canvas.width ||
           projectile.y + projectile.radius < 0 ||
           projectile.y - projectile.radius > canvas.height){
            setTimeout(() => { //helps remove projectiles that are still being animated in the edges of screen
                projectiles.splice(index, 1)
              }, 0)
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.update()

        //Ending game if player is touched by projectile
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)  
        if(dist - enemy.radius - player.radius < 1){
          cancelAnimationFrame(animationId) //everything should stop and freeze after collision
          modelEl.style.display = 'flex'
          bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
          const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)  
          //if its less than 1 we want to remove it from the screen
          if(dist - enemy.radius - projectile.radius < 1){
             
              //create number of particles when projectile hits the enemy 
              for (let i = 0; i < enemy.radius * 2; i++){
                  particles.push(new Particle(
                      projectile.x, 
                      projectile.y, 
                      Math.random() * 2,
                      enemy.color, 
                      { x: (Math.random() - 0.5) * (Math.random() * 5), 
                        y: (Math.random() - 0.5) * (Math.random() * 5)
                    }))
              }
              //trying to make enemy shrink and explode
              if (enemy.radius - 10 > 5) { //make those tiny sizes go away 
                 //increase our score 
                 score += 100
                 scoreEl.innerHTML = score

                gsap.to(enemy, { //adding animation event of shrinking
                    radius: enemy.radius -= 10
                })
                  setTimeout(() => { //helps remove the flash effect when projectile is removed
                    projectiles.splice(projectileIndex, 1)
                  }, 0)
              } else {
                score += 50
                scoreEl.innerHTML = score

                setTimeout(() => { //helps remove the flash effect when projectile is removed
                    enemies.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                  }, 0)
              }
          }
        })
    })
}

window.addEventListener('click', (event) => {
    //Produces angle based on x and y distance of your mouse
    //Function gives us distance from the center to our mouse click (event)
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2,)
    const velocity = {
        x: Math.cos(angle) * 5, //multiply velocity by factor to make it faster
        y: Math.sin(angle) * 5
    }

    //Creating new projectile == new instance
    projectiles.push(new Projectile(
        canvas.width / 2, 
        canvas.height / 2,  
        5, 
        'white', 
       velocity))
    })

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modelEl.style.display = "none"
})
