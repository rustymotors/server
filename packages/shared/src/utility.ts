// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Utility functions and color constants for shared package

export function argbToInt(
    alpha: number,
    red: number,
    green: number,
    blue: number,
) {
    return (
        ((alpha & 0xff) << 24) |
        ((red & 0xff) << 16) |
        ((green & 0xff) << 8) |
        (blue & 0xff)
    );
}

export function intToArgb(int: number) {
    return {
        alpha: (int >> 24) & 0xff,
        red: (int >> 16) & 0xff,
        green: (int >> 8) & 0xff,
        blue: int & 0xff,
    };
}

//skin colors
export const skin_pale = argbToInt(255, 255, 206, 165); //light pale
export const skin_tan = argbToInt(255, 206, 164, 122); //light tan
export const skin_brown = argbToInt(255, 112, 95, 78); //light brown
//shaded versions of the basic skin colors
export const dskin_pale = argbToInt(255, 140, 115, 90); //dark pale
export const dskin_tan = argbToInt(255, 124, 98, 72); //dark tan
export const dskin_brown = argbToInt(255, 63, 49, 35); //dark brown
//hair colors
export const hair_white = argbToInt(255, 255, 255, 255); //white
export const hair_platinum = argbToInt(255, 255, 242, 167); //platinum blonde
export const hair_blonde = argbToInt(255, 244, 219, 76); //blonde
export const hair_tan = argbToInt(255, 122, 100, 49); //tan
export const hair_red = argbToInt(255, 172, 69, 13); //red
export const hair_brown = argbToInt(255, 81, 65, 29); //brown
export const hair_black = argbToInt(255, 0, 0, 0); //black
//clothing colors
export const cloth_red = argbToInt(255, 212, 82, 82); //red
export const cloth_orange = argbToInt(255, 229, 139, 38); //orange
export const cloth_yellow = argbToInt(255, 255, 216, 0); //yellow
export const cloth_green = argbToInt(255, 112, 158, 113); //green
export const cloth_blue = argbToInt(255, 67, 81, 168); //blue
export const cloth_purple = argbToInt(255, 121, 80, 132); //purple
export const cloth_brown = argbToInt(255, 117, 104, 68); //brown
export const cloth_black = argbToInt(255, 68, 68, 68); //black
export const cloth_grey = argbToInt(255, 146, 143, 137); //grey
export const cloth_white = argbToInt(255, 255, 255, 255); //white
