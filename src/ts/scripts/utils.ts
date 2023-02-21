export function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function invlerp(x, y, a){
    return  clamp((a - x) / (y - x));
}

export function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

export function clamp(a, min = 0, max = 1){
    return Math.min(max, Math.max(min, a));
}

export function calcAngleDegrees(x, y) {
    return Math.atan2(y, x) * 180 / Math.PI;
}