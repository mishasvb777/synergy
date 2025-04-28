// задание 1

class Oven {
  constructor(maxTemperature) {
    this._maxTemperature = maxTemperature
  }

  get maxTemperature() {
    return this._maxTemperature
  }

  set maxTemperature(newTemperature) {
    if (newTemperature < this._maxTemperature + 15) {
      this._maxTemperature = newTemperature
    } else {
      console.log(
        `Ошибка: максимальная температура не может превышать ${
          this._maxTemperature + 15
        } градусов.`
      )
    }
  }
}

const myOven = new Oven(200)

console.log(`Максимальная температура: ${myOven.maxTemperature}`)

myOven.maxTemperature = 210
console.log(`Новая максимальная температура: ${myOven.maxTemperature}`)

myOven.maxTemperature = 220
console.log(
  `После попытки установить превышающую лимит температуру: ${myOven.maxTemperature}`
)

// задание 2

class ImprovedOven extends Oven {
  constructor(maxTemperature) {
    super(maxTemperature)
    this.isHeating = false
  }

  turnOn() {
    if (this.isHeating) {
      console.log('Печь уже включена.')
      return
    }

    console.log('Начало работы печи...')
    this.isHeating = true
    this.heatingInterval = setInterval(() => {
      if (this.currentTemperature < this.maxTemperature) {
        this.currentTemperature++
        console.log(`Температура: ${this.currentTemperature}°C`)
      } else {
        console.log('Печь достигла максимальной температуры.')
        clearInterval(this.heatingInterval)
        this.turnOff()
      }
    }, 500)
  }

  turnOff() {
    if (!this.isHeating) {
      console.log('Печь уже выключена.')
      return
    }

    console.log('Печь выключена.')
    this.isHeating = false
    this.coolingInterval = setInterval(() => {
      if (this.currentTemperature > 0) {
        this.currentTemperature--
        console.log(`Температура: ${this.currentTemperature}°C`)
      } else {
        console.log('Печь остыла.')
        clearInterval(this.coolingInterval)
      }
    }, 500)
  }
}

const myImprovedOven = new ImprovedOven(200)

console.log(
  `Максимальная температура улучшенной печи: ${myImprovedOven.maxTemperature}`
)

myImprovedOven.turnOn()
