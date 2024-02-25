const canvas = document.getElementById("rotor");
const context = canvas.getContext("2d");

const canvas_bg = document.getElementById("background");
const context_bg = canvas_bg.getContext("2d");

const canvas_camera = document.getElementById("camera");
const context_camera = canvas_camera.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas_bg.width = window.innerWidth;
canvas_bg.height = window.innerHeight;

canvas_camera.width = window.innerWidth;
canvas_camera.height = window.innerHeight;

const degree = Math.PI / 180.0; // 1 градус в радианах

// Класс точки с координатами x и y
class Point{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	draw(){
		context.beginPath();
		context.arc(this.x, this.y, 2, 0, Math.PI * 2);
		context.closePath();
		context.fill();
	}
}

// Рассчитывает координаты контрольной точки для кривой Безье
function calc_check_point(p1, p2, height){
	let _center = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
	
	// Вектор a от точки p1 к точке p2
	let a_x = p2.x - p1.x;
	let a_y = p2.y - p1.y;

	// Вектор b, перпендикулярный вектору a
	let b_x = 0;
	let b_y = 0;
	
	if(a_x == 0){
		b_x = height;
	}
	else if(a_y == 0){
		b_y = height;
	}
	else{
		b_y = (height) / Math.sqrt(1 + (a_y * a_y)/(a_x * a_x));
		b_x = -1 * b_y * (a_y / a_x);
	}

	let check_point = new Point(_center.x + b_x, _center.y + b_y);

	if(Math.hypot(center.x - check_point.x, center.y - check_point.y) < height){
		check_point.x = _center.x - b_x;
		check_point.y = _center.y - b_y;
	}

	return check_point;
}

let center = new Point(canvas.width / 2, canvas.height / 2); // Центр ротора
let const_center = new Point(center.x, center.y); // Неизменяемый центр
const center_offset = 15; // Смещение центра
let center_angle = 0; // Угол поворота центра

const rotor_radius = 100;
let rotor_angle = 0; //Угол поворота ротора [0; 120]

const check_point_height = 40; // Высота контрольной точки для рисования кривой Безье (стороны ротора)
const angle_speed = 1; // Угловая скорость

// Большая шестерня
let big_gear = {
	outer_radius: rotor_radius / 2,
	inner_radius: (rotor_radius / 2) * 0.85,
	tooth_size: rotor_radius / 15,
	angle: 0
}

// Малая шестерня
let small_gear = {
	radius: big_gear.inner_radius * (2.0/3.0),
	tooth_size: big_gear.tooth_size
}

// Отрисовка малой шестерни
let small_gear_teeth = []; // Вершины зубьев шестерни
let small_teeth_places = []; // Места где стоят зубья

for(let i = 0, j = 0; j <= 16; i += 22.5, j++){
	let p = new Point();
	p.x = (small_gear.radius - small_gear.tooth_size) * Math.cos(i * degree) + const_center.x;
	p.y = (small_gear.radius - small_gear.tooth_size) * Math.sin(i * degree) + const_center.y;
	small_gear_teeth.push(p);
}

for(let i = 11.25, j = 0; j < 16; i += 22.5, j++){
	let p = new Point();
	p.x = small_gear.radius * Math.cos(i * degree) + const_center.x;
	p.y = small_gear.radius * Math.sin(i * degree) + const_center.y;
	small_teeth_places.push(p);
}

context_bg.beginPath();
context_bg.fillStyle = "rgb(228,14,88)";

for(let i = 0; i < small_teeth_places.length; i++){
	context_bg.lineTo(small_teeth_places[i].x, small_teeth_places[i].y);
	context_bg.lineTo(small_gear_teeth[i+1].x, small_gear_teeth[i+1].y);
}

context_bg.closePath();
context_bg.fill();
context_bg.stroke();

//Отрисовка камеры сгорания

context_camera.beginPath();
context_camera.fillStyle = "rgb(228,228,228)";



context_camera.closePath();
context_camera.fill();
context_camera.stroke();

function draw_rotor(){
	// Вращение центра
	center.x = const_center.x + (center_offset * Math.cos(center_angle * degree));
	center.y = const_center.y + (center_offset * Math.sin(center_angle * degree));

	// Вершины ротора
	let p1 = new Point(center.x + rotor_radius * Math.cos(rotor_angle * degree), center.y + rotor_radius * Math.sin(rotor_angle * degree));
	let p2 = new Point(center.x + rotor_radius * Math.cos((120 + rotor_angle) * degree), center.y + rotor_radius * Math.sin((120 + rotor_angle) * degree));
	let p3 = new Point(center.x + rotor_radius * Math.cos((240 + rotor_angle) * degree), center.y + rotor_radius * Math.sin((240 + rotor_angle) * degree));
	
	// Контрольные точки, для рисования кривых Безье (сторон ротора)
	let p10 = calc_check_point(p1, p2, check_point_height);
	let p20 = calc_check_point(p2, p3, check_point_height);
	let p30 = calc_check_point(p3, p1, check_point_height);
	
	//Очитска экрана
	context.clearRect(0, 0, innerWidth, innerHeight);

	// Рисование ротора
	context.fillStyle = "rgb(14,88,228)";

	context.beginPath();
	context.moveTo(p1.x, p1.y);

	context.quadraticCurveTo(p30.x, p30.y, p3.x, p3.y);
	context.quadraticCurveTo(p20.x, p20.y, p2.x, p2.y);
	context.quadraticCurveTo(p10.x, p10.y, p1.x, p1.y);
	
	context.closePath();
	
	context.stroke();
	context.fill();

	// Рисование большей шестерни
	context.fillStyle = "rgb(14,228,88)";

	context.beginPath();
	context.arc(center.x, center.y, big_gear.outer_radius, 0, 2 * Math.PI);
	context.closePath();
	context.fill();
	context.stroke();

	context.beginPath();
	context.fillStyle = "rgb(255,255,255)";
	// context.arc(center.x, center.y, big_gear.inner_radius, 0, 2 * Math.PI);

	let big_gear_teeth = []; // Вершины зубьев шестерни
	let big_teeth_places = []; // Места где стоят зубья

	for(let i = big_gear.angle, j = 0; j <= 24; i += 15, j++){
		let p = new Point();
		p.x = (big_gear.inner_radius - big_gear.tooth_size) * Math.cos(i * degree) + center.x;
		p.y = (big_gear.inner_radius - big_gear.tooth_size) * Math.sin(i * degree) + center.y;
		big_gear_teeth.push(p);
	}

	for(let i = big_gear.angle + 7.5, j = 0; j < 24; i += 15, j++){
		let p = new Point();
		p.x = big_gear.inner_radius * Math.cos(i * degree) + center.x;
		p.y = big_gear.inner_radius * Math.sin(i * degree) + center.y;
		big_teeth_places.push(p);
	}

	big_gear.angle += angle_speed;
	if(big_gear.angle == 15){ big_gear.angle = 0; }
	
	for(let i = 0; i < big_teeth_places.length; i++){
		context.lineTo(big_teeth_places[i].x, big_teeth_places[i].y);
		context.lineTo(big_gear_teeth[i+1].x, big_gear_teeth[i+1].y);
	}
	
	context.closePath();
	context.fill();
	context.stroke();
	
	// Рисование центра
	context.fillStyle = "rgb(255,0,0)";
	center.draw();
	const_center.draw();

	// Изменение угла поворота
	rotor_angle += angle_speed;
	if(rotor_angle >= 120){
		rotor_angle = 0;
	}

	center_angle += angle_speed * 3; 
	if(center_angle >= 360){
		center_angle = 0;
	}
}

setInterval(draw_rotor, 10);
