const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

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
	inner_radius: (rotor_radius / 2) * 0.8,
	tooth_size: rotor_radius / 10
}

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
	context.fillStyle = "rgb(169,169,169)";

	context.beginPath();
	context.arc(center.x, center.y, big_gear.outer_radius, 0, 2 * Math.PI);

	context.arc(center.x, center.y, big_gear.inner_radius, 0, 2 * Math.PI);

	let geer_teeth = []; // Вершины зубьев шестерни
	let teeth_places = []; // Места где стоят зубья

	for(let i = 0; i <= 360; i += 15){
		let p = new Point();
		p.x = (big_gear.inner_radius - big_gear.tooth_size) * Math.cos(i * degree) + center.x;
		p.y = (big_gear.inner_radius - big_gear.tooth_size) * Math.sin(i * degree) + center.y;
		geer_teeth.push(p);
	}

	for(let i = 7.5; i < 360; i += 15){
		let p = new Point();
		p.x = big_gear.inner_radius * Math.cos(i * degree) + center.x;
		p.y = big_gear.inner_radius * Math.sin(i * degree) + center.y;
		teeth_places.push(p);
	}
	
	for(let i = 0; i < teeth_places.length; i++){
		context.moveTo(geer_teeth[i].x, geer_teeth[i].y);
		context.lineTo(teeth_places[i].x, teeth_places[i].y);
		context.moveTo(teeth_places[i].x, teeth_places[i].y);
		context.lineTo(geer_teeth[i+1].x, geer_teeth[i+1].y);
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

setInterval(draw_rotor, 25);
