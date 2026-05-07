package main

import (
	"fmt"
)

func test(s []int) {
    s = append(s, 100)
    fmt.Println("внутри:", s)
}


type User struct {
    Name string
    Age int
}

func (u *User) Birthday() {
    u.Age++
}

func main() {
   us := User{Name: "Коля", Age: 12}
   fmt.Println(us)

   c := &us

   c.Name = "Миша"
    c.Age = 15
   fmt.Println(us)

   us.Birthday()M

   fmt.Println(us)

}


