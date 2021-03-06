u#version 440 
layout(local_size_x = 32) in;

struct CellData{
    vec2 position;
    vec2 angle;
};

struct TexCellData{
    float color;
};

uniform float u_dt;
uniform ivec2 u_field_size;

const float PI = 3.1415926535897932384626433832795;
const float TAU = 2.0*PI;

layout(shared, binding = 0) writeonly buffer OutputData
{
    CellData next[];
};

layout(shared, binding = 1) readonly buffer InputData
{
    CellData input_data[];
};

layout(shared, binding = 2) buffer TexData
{
    TexCellData tex_data[];
};

int GetArrayId(ivec2 pos)
{
    return pos.x + pos.y * int(u_field_size.x);
}

float rand(float n){return fract(sin(n) * 43758.5453123);}

uniform int u_sensor_size = 3;
uniform int u_sensor_stride = 3;
uniform int u_sensor_offset = 30;
uniform int u_trail_weight = 10;
uniform float u_turn_speed = 40.0;
uniform float u_speed = 300.0;

float sense(CellData agent, float sensorAngleOffset) {
	float sensorAngle = agent.angle.x + sensorAngleOffset;
	vec2 sensorDir = vec2(cos(sensorAngle), sin(sensorAngle));

	vec2 sensorPos = (agent.position*u_field_size) + sensorDir * u_sensor_offset;
	int sensorCentreX = int(sensorPos.x);
	int sensorCentreY = int(sensorPos.y);

	float sum = 0;

	for (int offsetX = -u_sensor_size; offsetX <= u_sensor_size; offsetX ++) {
		for (int offsetY = -u_sensor_size; offsetY <= u_sensor_size; offsetY ++) {
			int sampleX = min(u_field_size.x - 1, max(0, sensorCentreX + offsetX * u_sensor_stride));
			int sampleY = min(u_field_size.y - 1, max(0, sensorCentreY + offsetY * u_sensor_stride));
			sum += tex_data[GetArrayId(ivec2(sampleX,sampleY))].color;
		}
	}

	return sum;
}

void main() {

    CellData curr = input_data[gl_GlobalInvocationID.x];
    

    CellData self;
	self.angle = curr.angle;
	self.position = curr.position;
	vec2 pos = self.position * u_field_size;

	ivec2 pixel_cord = ivec2(self.position * u_field_size);

	// Steer based on sensory data
	float sensorAngleRad = 40 * (3.1415 / 180);
	float weightForward = sense(self, 0);
	float weightLeft = sense(self, sensorAngleRad);
	float weightRight = sense(self, -sensorAngleRad);

	
	float randomSteerStrength = 1.0 + (rand(pos.x * rand(pos.y))-0.5) * 0.7;

	// Continue in same direction
	if (weightForward > weightLeft && weightForward > weightRight) {
		self.angle += 0;
	}
	else if (weightForward < weightLeft && weightForward < weightRight) {
		self.angle += (randomSteerStrength - 0.5) * 2 * u_turn_speed * u_dt;
	}
	// Turn right
	else if (weightRight > weightLeft) {
		self.angle -= randomSteerStrength * u_turn_speed * u_dt;
	}
	// Turn left
	else if (weightLeft > weightRight) {
		self.angle += randomSteerStrength * u_turn_speed * u_dt;
	}


	// Update position
	vec2 direction = vec2(cos(self.angle[0]), sin(self.angle[0]));
	vec2 newPos = self.position * u_field_size + direction * u_dt * u_speed;

	
	// Clamp position to map boundaries, and pick new random move dir if hit boundary
	if (newPos.x < 0 || newPos.x >= u_field_size.x || newPos.y < 0 || newPos.y >= u_field_size.y) {
		float randomAngle = rand(self.position.x * gl_GlobalInvocationID.x / self.position.y);

		newPos.x = min(u_field_size.x-1,max(0, newPos.x));
		newPos.y = min(u_field_size.y-1,max(0, newPos.y));
		self.angle[0] += randomAngle + 2.89;
	}
	else {
		ivec2 coord = ivec2(newPos);
		float oldTrail = tex_data[GetArrayId(coord)].color;
		tex_data[GetArrayId(coord)].color = min(1, oldTrail + u_trail_weight * u_dt);
	}
	self.position = newPos/u_field_size;


	TexCellData tc;
	tc.color = 1.0;


    next[gl_GlobalInvocationID.x] = self;
}
#version 440 
layout(local_size_x = 32) in;

struct CellData{
    vec2 position;
    vec2 angle;
};

struct TexCellData{
    float color;
};

uniform float u_dt;
uniform ivec2 u_field_size;

const float PI = 3.1415926535897932384626433832795;
const float TAU = 2.0*PI;

layout(shared, binding = 0) writeonly buffer OutputData
{
    CellData next[];
};

layout(shared, binding = 1) readonly buffer InputData
{
    CellData input_data[];
};

layout(shared, binding = 2) buffer TexData
{
    TexCellData tex_data[];
};

int GetArrayId(ivec2 pos)
{
    return pos.x + pos.y * int(u_field_size.x);
}

float rand(float n){return fract(sin(n) * 43758.5453123);}

uniform int u_sensor_size = 3;
uniform int u_sensor_stride = 3;
uniform int u_sensor_offset = 30;
uniform int u_trail_weight = 10;
uniform float u_turn_speed = 40.0;
uniform float u_speed = 300.0;

float sense(CellData agent, float sensorAngleOffset) {
	float sensorAngle = agent.angle.x + sensorAngleOffset;
	vec2 sensorDir = vec2(cos(sensorAngle), sin(sensorAngle));

	vec2 sensorPos = (agent.position*u_field_size) + sensorDir * u_sensor_offset;
	int sensorCentreX = int(sensorPos.x);
	int sensorCentreY = int(sensorPos.y);

	float sum = 0;

	for (int offsetX = -u_sensor_size; offsetX <= u_sensor_size; offsetX ++) {
		for (int offsetY = -u_sensor_size; offsetY <= u_sensor_size; offsetY ++) {
			int sampleX = min(u_field_size.x - 1, max(0, sensorCentreX + offsetX * u_sensor_stride));
			int sampleY = min(u_field_size.y - 1, max(0, sensorCentreY + offsetY * u_sensor_stride));
			sum += tex_data[GetArrayId(ivec2(sampleX,sampleY))].color;
		}
	}

	return sum;
}

void main() {

    CellData curr = input_data[gl_GlobalInvocationID.x];
    

    CellData self;
	self.angle = curr.angle;
	self.position = curr.position;
	vec2 pos = self.position * u_field_size;

	ivec2 pixel_cord = ivec2(self.position * u_field_size);

	// Steer based on sensory data
	float sensorAngleRad = 40 * (3.1415 / 180);
	float weightForward = sense(self, 0);
	float weightLeft = sense(self, sensorAngleRad);
	float weightRight = sense(self, -sensorAngleRad);

	
	float randomSteerStrength = 1.0 + (rand(pos.x * rand(pos.y))-0.5) * 0.7;

	// Continue in same direction
	if (weightForward > weightLeft && weightForward > weightRight) {
		self.angle += 0;
	}
	else if (weightForward < weightLeft && weightForward < weightRight) {
		self.angle += (randomSteerStrength - 0.5) * 2 * u_turn_speed * u_dt;
	}
	// Turn right
	else if (weightRight > weightLeft) {
		self.angle -= randomSteerStrength * u_turn_speed * u_dt;
	}
	// Turn left
	else if (weightLeft > weightRight) {
		self.angle += randomSteerStrength * u_turn_speed * u_dt;
	}


	// Update position
	vec2 direction = vec2(cos(self.angle[0]), sin(self.angle[0]));
	vec2 newPos = self.position * u_field_size + direction * u_dt * u_speed;

	
	// Clamp position to map boundaries, and pick new random move dir if hit boundary
	if (newPos.x < 0 || newPos.x >= u_field_size.x || newPos.y < 0 || newPos.y >= u_field_size.y) {
		float randomAngle = rand(self.position.x * gl_GlobalInvocationID.x / self.position.y);

		newPos.x = min(u_field_size.x-1,max(0, newPos.x));
		newPos.y = min(u_field_size.y-1,max(0, newPos.y));
		self.angle[0] += randomAngle + 2.89;
	}
	else {
		ivec2 coord = ivec2(newPos);
		float oldTrail = tex_data[GetArrayId(coord)].color;
		tex_data[GetArrayId(coord)].color = min(1, oldTrail + u_trail_weight * u_dt);
	}
	self.position = newPos/u_field_size;


	TexCellData tc;
	tc.color = 1.0;


    next[gl_GlobalInvocationID.x] = self;
}
