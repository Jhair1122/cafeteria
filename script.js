// ========== MENÚ MÓVIL ==========
const toggleBtn = document.querySelector('.menu-toggle');
const navList = document.querySelector('nav ul');
if (toggleBtn && navList) {
    toggleBtn.addEventListener('click', () => navList.classList.toggle('show'));
    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navList.classList.remove('show'));
    });
}

// ========== HEADER SCROLL ==========
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ========== REVEAL DE SECCIONES (más suave) ==========
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
sections.forEach(section => observer.observe(section));

// ========== EFECTO TILT + BRILLO EN TARJETAS ==========
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
        // Actualizar posición del brillo
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
    });
});

// ========== EFECTO 3D EN EL TEXTO DEL HÉROE (SIGUE AL RATÓN) ==========
const heroContent = document.querySelector('.hero-content');
if (heroContent) {
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        heroContent.style.transform = `rotateX(${-y * 0.5}deg) rotateY(${x * 0.5}deg) translateZ(0)`;
    });
}

// ========== ACTUALIZAR ENLACE ACTIVO ==========
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`nav a[href="#${id}"]`)?.classList.add('active');
        } else {
            document.querySelector(`nav a[href="#${id}"]`)?.classList.remove('active');
        }
    });
});

// ========== CARGA DINÁMICA DE THREE.JS (ESCENA MEJORADA) ==========
async function initThreeScene() {
    const container = document.getElementById('three-container');
    if (!container) return;

    try {
        const THREE = await import('three');

        const scene = new THREE.Scene();
        scene.background = null;
        scene.fog = new THREE.FogExp2(0x1A0F0A, 0.0015);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 1.8, 8);
        camera.lookAt(0, 0.6, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Iluminación dramática
        scene.add(new THREE.AmbientLight(0x553322, 0.6));
        const spotLight = new THREE.SpotLight(0xffccaa, 1.2);
        spotLight.position.set(3, 5, 5);
        spotLight.castShadow = true;
        spotLight.receiveShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        scene.add(spotLight);

        const backLight = new THREE.PointLight(0xffaa00, 0.5);
        backLight.position.set(-3, 1, -3);
        scene.add(backLight);

        // Grupo de la taza con más detalle
        const cupGroup = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8f0e0, roughness: 0.2, metalness: 0.15 });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.95, 2.1, 64), bodyMat);
        body.castShadow = body.receiveShadow = true;
        cupGroup.add(body);

        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.16, 24, 48), bodyMat);
        handle.position.set(1.25, 0.2, 0);
        handle.rotation.z = Math.PI/2;
        handle.castShadow = handle.receiveShadow = true;
        cupGroup.add(handle);

        const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3A1A10, roughness: 0.1, emissive: new THREE.Color(0x110500), emissiveIntensity: 0.25 });
        const coffee = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.15, 64), coffeeMat);
        coffee.position.y = 1.0;
        coffee.castShadow = coffee.receiveShadow = true;
        cupGroup.add(coffee);

        const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.07, 16, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 }));
        rim.position.y = 1.07;
        rim.rotation.x = Math.PI/2;
        rim.castShadow = rim.receiveShadow = true;
        cupGroup.add(rim);

        const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.15, 64), bodyMat);
        plate.position.y = -1.1;
        plate.castShadow = plate.receiveShadow = true;
        cupGroup.add(plate);

        scene.add(cupGroup);

        // Granos flotantes con movimiento más orgánico
        const beanGroup = new THREE.Group();
        const beanGeo = new THREE.SphereGeometry(0.13, 8, 6);
        beanGeo.scale(1, 1, 0.65);
        const beanMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.5 });
        for (let i = 0; i < 50; i++) {
            const bean = new THREE.Mesh(beanGeo, beanMat);
            bean.position.set((Math.random() - 0.5) * 8, Math.random() * 6, (Math.random() - 0.5) * 6);
            bean.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            bean.userData = { speed: 0.01 + Math.random()*0.02, rot: (Math.random()-0.5)*0.04, offset: Math.random()*100 };
            beanGroup.add(bean);
        }
        scene.add(beanGroup);

        // Vapor volumétrico
        const steamGroup = new THREE.Group();
        const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
        for (let i=0; i<100; i++) {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 4, 4), steamMat);
            p.position.set((Math.random()-0.5)*1.8, 1.05, (Math.random()-0.5)*1.8);
            p.userData = { speed: 0.01+Math.random()*0.03, life: Math.random(), max: 1.2 };
            steamGroup.add(p);
        }
        cupGroup.add(steamGroup);

        // Movimiento con ratón
        let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
        window.addEventListener('mousemove', e => {
            mouseX = (e.clientX/window.innerWidth)*2-1;
            mouseY = -(e.clientY/window.innerHeight)*2+1;
        });

        function animate() {
            requestAnimationFrame(animate);
            targetX += (mouseX*1.2 - targetX)*0.04;
            targetY += (mouseY*0.6 - targetY)*0.04;
            camera.position.x = targetX*2;
            camera.position.y = 1.8 + targetY*0.6;
            camera.lookAt(0, 0.5, 0);

            cupGroup.rotation.y += 0.004;
            beanGroup.rotation.y += 0.001;
            beanGroup.children.forEach(b => {
                b.rotation.x += b.userData.rot;
                b.rotation.y += b.userData.rot*0.5;
                b.position.y += Math.sin(Date.now()*0.005 + b.userData.offset)*0.002;
            });

            steamGroup.children.forEach(p => {
                p.position.y += p.userData.speed;
                p.userData.life += 0.008;
                p.material.opacity = 0.25 * (1 - p.userData.life/p.userData.max);
                if (p.position.y > 3 || p.userData.life >= p.userData.max) {
                    p.position.y = 1.05;
                    p.position.x = (Math.random()-0.5)*1.8;
                    p.position.z = (Math.random()-0.5)*1.8;
                    p.userData.life = 0;
                    p.material.opacity = 0.25;
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth/container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    } catch (e) {
        console.warn('Three.js no cargó, la escena 3D no está disponible.');
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initThreeScene);
else initThreeScene();