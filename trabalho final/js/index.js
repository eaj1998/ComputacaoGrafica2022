var scene; //mundo virtual
var camera; //area de visualização
var renderer; //responsavel por renderizar tudo
var controls; //controle do mouser

var parametrosGUI = {};
var animationFolder;

var elementos = [];

var velocidade = 0.07;

var ground;
var geometriaA;

var lights = [];

var wolfVelocity = 0;

//variaveis para animação
var mixer;
var mixer1;
var mixer2;
var mixer3;

var mixerPessoa1;
var mixerPessoa2;
var mixerPessoa3;

var modelReady = false;
var animationActions = Array();
var activeAction;
var lastAction;
var loadFinishedZombie0;
var loadFinishedZombie1;
var loadFinishedZombie2;
var loadFinishedZombie3;
var loadFinishedPessoa0;
var loadFinishedPessoa1;
var loadFinishedPessoa2;

var clock = new THREE.Clock();

var objLoading = function () {
	loader = new THREE.OBJLoader();

	//carregando Zombie 0
	let loaderFBX = new THREE.FBXLoader();
	loaderFBX.load(
		'assets/zombie/zombie.fbx',//arquivo que vamos buscar
		function (obj) {
			//atribui a cena, colore, reposiciona, rotaciona
			elementos['zombie0'] = obj;

			obj.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			}
			);
			var anim1 = new THREE.FBXLoader();
			anim1.setPath("assets/zombie/");
			anim1.load("zombie.fbx", (anim1) => {
				mixer = new THREE.AnimationMixer(obj);
				const dance = mixer.clipAction(anim1.animations[0]);
				dance.play();
			});


			obj.scale.y = 0.08;
			obj.scale.z = 0.08;
			obj.scale.x = 0.08;

			obj.position.z = 5;
			obj.position.x = 7;
			obj.position.y = -7;

			scene.add(obj);
			loadFinishedZombie0 = true;

		});

	//Load do Pessoa 0
	loaderFBX.load(
		'assets/pessoa/jasper.fbx',//arquivo que vamos buscar
		function (obj) {
			//atribui a cena, colore, reposiciona, rotaciona
			elementos['pessoa1'] = obj;


			obj.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			}
			);

			var anim = new THREE.FBXLoader();
			anim.setPath("assets/pessoa/");
			anim.load("Terrified.fbx", (anim) => {
				mixerPessoa1 = new THREE.AnimationMixer(obj);
				const kick = mixerPessoa1.clipAction(anim.animations[0]);
				kick.play();
			});


			obj.scale.y = 0.10;
			obj.scale.z = 0.10;
			obj.scale.x = 0.10;

			obj.position.z = 5;
			obj.position.x = 25;
			obj.position.y = -7;

			scene.add(obj);
			loadFinishedPessoa0 = true;

	});


	for (i = 0; i < 5; i++)
		loader.load(
			'assets/tree.obj', //arquivo que vamos carregar
			function (object) {

				object.traverse(function (child) {
					if (child instanceof THREE.Mesh) {
						child.material = new THREE.MeshLambertMaterial();
						child.material.map = new THREE.TextureLoader().load("assets/texturas/Wood.jpg");
						child.material.shininess = 0;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});

				object.scale.x = 50;
				object.scale.y = 50;
				object.scale.z = 50;

				object.position.z = Math.random() * 200 * (Math.random() > 0.5 ? -1 : 1);
				object.position.x = Math.random() * 200 * (Math.random() > 0.5 ? -1 : 1);

				object.position.y = -7;


				//object.rotation.y += 1;

				object.castShadow = true;

				// camera.lookAt(objCarregado.position)

				scene.add(object);
			},//metodo, tudo deu certo
			function (andamento) {
				console.log((andamento.loaded / andamento.total * 100) + "% pronto!");
			},//metodo executa enquanto carrega
			function (error) {
				console.log("Deu caca: " + error);
			} //metodo deu merda
		);
};
//troca a ação do nosso modelo
const setAction = function (toAction) {
	if (toAction != activeAction) {
		lastAction = activeAction;
		activeAction = toAction;
		lastAction.stop();
		activeAction.reset();
		activeAction.play();
	}
}

var ambientLightOn = function () {
	lights['ambient'] = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(lights['ambient']);
}

var hemisphereLightOn = function () {
	lights['hemisphere'] = new THREE.HemisphereLight(0xcce0ff, 0xffffff, 0);
	scene.add(lights['hemisphere']);
}

var directionalLightOn = function () {
	let light = new THREE.DirectionalLight(0xffffff, 1);
	light.castShadow = true;
	light.shadow.mapSize.width = 4096;
	light.shadow.mapSize.height = 4096;
	light.shadow.camera.left = 1000;
	light.shadow.camera.bottom = 1000;
	light.shadow.camera.right = -1000
	light.shadow.camera.top = -1000;

	light.position.y = 200;
	light.position.x = 100;
	light.target = ground;


	scene.add(light);
	scene.add(light.target)

	lights['directional'] = light;
}

var spotLightOn = function () {
	let spot = new THREE.SpotLight(0xffffff, 0);
	spot.angle = 0.3;
	spot.castShadow = true;

	spot.position.z = 40;
	spot.position.y = 15;

	spot.shadow.distance = 20;
	spot.shadow.penumbra = 30;
	spot.shadow.angle = 25;

	spot.target.position.set(0, 5, 0);

	lights['spot'] = spot;
	scene.add(spot);
}

var pointLightOn = function () {
	let point = new THREE.PointLight(0xffffff, 3, 200);
	lights['point'] = point;
	point.castShadow = true;
	point.position.y = 10;
	point.position.z = 10;

	scene.add(point);
}

var godSaysLightsOn = function () {
	//hemisphereLightOn();
	directionalLightOn();
	//spotLightOn();
	//pointLightOn();
	ambientLightOn();
}


var createGui = function () {
	const gui = new dat.GUI();

	parametrosGUI = {
		scalarPuppet: 1,
		positionX: 0,
		positionY: -6,
		positionZ: 0,
		ambientLight: 0.4,
		sunLight: 0,

		skyColor: "#000000",
		groundColor: "#586958",

		geometrias: "",
		modelGui: "",
		walk: function () {
			setAction(animationActions[1]);
			wolfVelocity = 0.05;
		},
		run: function () {
			setAction(animationActions[0]);
			wolfVelocity = 0.2;
		},
		sit: function () {
			setAction(animationActions[3])
		},
		creep: function () {
			setAction(animationActions[5])
		},
		idle: function () {
			setAction(animationActions[4])
		},
		seiNao: function () {
			setAction(animationActions[2])
		}
	};

	let fazScala = gui.add(parametrosGUI, 'scalarPuppet').min(0.1).max(2).step(0.1).name("Scale");
	fazScala.onChange(function (parametro) {
		elementos[parametrosGUI.modelGui].scale.x = parametro;
		elementos[parametrosGUI.modelGui].scale.y = parametro;
		elementos[parametrosGUI.modelGui].scale.z = parametro;
	}
	);

	let intensidadeLuz = gui.add(parametrosGUI, 'ambientLight').min(0).max(2).step(0.1).name("Ambient Light");
	intensidadeLuz.onChange(function (parametro) {
		lights['ambient'].intensity = parametro;
	}
	);

	let sunLight = gui.add(parametrosGUI, 'sunLight').min(0).max(2).step(0.1).name("Sun Light");
	sunLight.onChange(function (parametro) {
		lights['directional'].intensity = parametro;
	}
	);


	let opcoes = ['Zombie', 'Pessoa'];
	let comboChange = gui.add(parametrosGUI, 'geometrias').options(opcoes).name("Objetos");
	comboChange.onChange(function (parametro) {
		if (parametro == 'Zombie') {
			camera.lookAt(elementos["zombie0"].position);
			parametrosGUI.modelGui = "zombie";
		} else if (parametro == 'Pessoa') {
			camera.lookAt(elementos["pessoa1"].position);
			parametrosGUI.modelGui = "pessoa1";
		}
	}
	);
	let folderPosition = gui.addFolder("Position");

	let positionX = folderPosition.add(parametrosGUI, 'positionX').min(0).max(600).step(15).name("Position X");
	positionX.onChange(function (parametro) {
		lights['directional'].position.x = parametro;
	}
	);
	let positionY = folderPosition.add(parametrosGUI, 'positionY').min(0).max(600).step(15).name("Position Y");
	positionY.onChange(function (parametro) {
		lights['directional'].position.y = parametro;
	}
	);
	let positionZ = folderPosition.add(parametrosGUI, 'positionZ').min(0).max(600).step(15).name("Position Z");
	positionZ.onChange(function (parametro) {
		lights['directional'].position.z = parametro;
	}
	);

	let colorFolder = gui.addFolder('Coloros');
	let sColor = colorFolder.addColor(parametrosGUI, 'skyColor').name("Dollie's Color");
	sColor.onChange(function (parametro) {
		elementos["ove"].traverse(function (child) {
			if (child.isMesh) {
				child.material.color = new THREE.Color(parametro);
			}
		}
		);
	}
	);
	let gColor = colorFolder.addColor(parametrosGUI, 'groundColor').name("Ground");
	gColor.onChange(function (parametro) {
		ground.material.color.setHex(parametro.replace("#", "0x"));
	}
	);

	animationFolder = gui.addFolder('Animations');


	//gui.add(parametrosGUI, 'b').name("Variavel2");

	//scene.add(gui);
	gui.open();

}

var init = function () {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcce0ff);

	//	Camera em perspectiva
	camera = new THREE.PerspectiveCamera(
		100, // view angle
		window.innerWidth / window.innerHeight, //aspect ratio
		1, //near
		500 //far
	);



	// geometriaA = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff0000}));
	// geometriaA.position.x = -8;
	// scene.add(geometriaA);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera.position.z = 50;
	camera.position.x = 0;
	camera.position.y = 1.7;

	createGui();

	//criaMonstro();	

	objLoading();

	animation();


	//criar um piso.
	let textureLoad = new THREE.TextureLoader();
	let groundTexture = textureLoad.load("assets/texturas/terrain/grasslight-big.jpg"); //busca a imagem
	groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping; //quero que ela se repita
	groundTexture.encoding = THREE.sRGBEncoding; //padrão cores, sempre que existir será informado
	groundTexture.repeat.set(25, 25); //número de vezes que ela vai se repetir dentro do nosso chão

	let materialGround = new THREE.MeshLambertMaterial({ map: groundTexture });
	materialGround.normalMap = textureLoad.load("assets/texturas/terrain/grasslight-big-nm.jpg"); //busca a normal, que da noção básica de profundidade


	ground = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1000, 1000),
		materialGround
	);
	ground.receiveShadow = true;//chao recebe as sombras.
	ground.rotation.x = - Math.PI / 2;
	ground.position.y -= 7.5;
	scene.add(ground);
	godSaysLightsOn();

	//camera.add(lights["spot"]);

	controls = new THREE.OrbitControls(camera, renderer.domElement);

	scene.fog = new THREE.Fog(0xcce0ff, 100, 500);


	document.addEventListener('keydown', apertouButao);
	document.addEventListener('keyup', soltouBotao);

};



var key_r = false;
var key_space = false;
var key_q = false;

var soltouBotao = function (e) {

	if (e.keyCode == 82) { //r
		key_r = false;
	}
	if (e.keyCode == 32) { //espaço
		key_space = false;
	}
	if (e.keyCode == 81) { //espaço
		key_q = false;
	}
}


var apertouButao = function (e) {

	if (e.keyCode == 82) { //r
		elementos['cerberus'].rotation.x += 0.1;
		key_r = true;
	}
	if (e.keyCode == 32) { // space
		key_space = true;
		pulando = true;
		if (lights['spot'].intensity == 0)
			lights['spot'].intensity = 1;
		else
			lights['spot'].intensity = 0;
	}

	if (e.keyCode == 81) { // q
		key_q = true;
	}

	if (e.keyCode == 38) { //douwn
		camera.position.z -= 0.5;
		//elementos["puppet"]["tronco"].position.z += 1;
	}
	if (e.keyCode == 40) { // UP
		//elementos["puppet"]["tronco"].position.z -= 1;
		camera.position.z += 0.5;
	}

	switch (e.key) {
		case 'a':
			elementos['zombie0'].rotation.y = -1.5
			break;
		case 'd':
			elementos['zombie0'].rotation.y = 1.5
			break;
		case 'w':
			elementos['zombie0'].rotation.y = 0
			break;
		case 's':
			elementos['zombie0'].rotation.y = 3
			break;
		case 'l':
			acao('dancing');
			break;
		case 'k':
			acao('Kicking');
			break;
		case 'j':
			acao('Walking');
			break;
	}
}

var acao = function(acao){
	var anim1 = new THREE.FBXLoader();
	anim1.setPath("assets/zombie/");
	anim1.load(acao+".fbx", (anim1) => {
		mixer = new THREE.AnimationMixer(elementos['zombie0']);
		const dance = mixer.clipAction(anim1.animations[0]);
		dance.play();
	});

}

var count = 0;
var velocidadeOmbroDireitoC = -0.01;
var velocidadeOmbroDireitoL = -0.01;
var pulando = false;
var velocidadePulo = 0.5;
var altura = -1;
var animation = function () {
	requestAnimationFrame(animation);

	let delta = clock.getDelta();

	if (loadFinishedZombie0) {
		mixer.update(delta);
	} else {
		console.log('Zombie0 nao funfou');
	}

	if (loadFinishedZombie1) {
		mixer1.update(delta);
	} else {
	}

	if (loadFinishedZombie2) {
		mixer2.update(delta);
	} else {
	}

	if (loadFinishedZombie3) {
		mixer3.update(delta);
	} else {
	}

	if (loadFinishedPessoa0) {
		mixerPessoa1.update(delta);
	} else {
		
	}


	renderer.render(scene, camera); //tira uma foto do estado e mostra na tela
}

function paraRadianos(angulo) {
	return angulo * (Math.PI / 180);
}

window.onload = this.init