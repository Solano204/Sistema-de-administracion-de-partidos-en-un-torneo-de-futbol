package com.soccer.fut7.soccer_system.ValueObject;
public record Cards(int yellowCards, int redCards) {
   

    public static Cards of(int yellowCards, int redCards) {
        return new Cards(yellowCards, redCards);
    }

    public static Cards none() {
        return new Cards(0, 0);
    }
}
