interface Observer {
  notify: Function
}

class CreateObserver implements Observer {
  constructor(private name: string) {}
  notify() {
    console.log(`${this.name}：missile alert`)
  }
}

class Subject {
  private observes: Observer[] = []
  public addObserver(observer: Observer): void {
    this.observes.push(observer)
  }
  public notifyObservers(): void {
    console.log('notify all the observer')
    this.observes.forEach(ob => ob.notify())
  }
}

const subject: Subject = new Subject()

const obA = new CreateObserver('obA')
const obB = new CreateObserver('obB')

subject.addObserver(obA)
subject.addObserver(obB)

subject.notifyObservers()
