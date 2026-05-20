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

// ========== REVEAL DE SECCIONES ==========
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });
sections.forEach(section => observer.observe(section));

// ========== TILT LIGERO EN TARJETAS (Bebidas/Regiones) ==========
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    });
});

// ========== ACTUALIZAR ENLACE ACTIVO ==========
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 130;
        const sectionHeight = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`nav a[href="#${id}"]`)?.classList.add('active');
        } else {
            document.querySelector(`nav a[href="#${id}"]`)?.classList.remove('active');
        }
    });
});

// ========== ESCENA 3D OPTIMIZADA ==========
async function initThreeScene() {
    const container = document.getElementById('three-container');
    if (!container) return;

    try {
        const THREE = await import('three');

        const scene = new THREE.Scene();
        scene.background = null;
        scene.fog = new THREE.FogExp2(0x1A0F0A, 0.001);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
        camera.position.set(0, 1.6, 7);
        camera.lookAt(0, 0.5, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Iluminación
        scene.add(new THREE.AmbientLight(0x665544, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffeedd, 1);
        dirLight.position.set(3, 6, 4);
        dirLight.castShadow = true;
        dirLight.receiveShadow = true;
        dirLight.shadow.mapSize.width = 512;
        dirLight.shadow.mapSize.height = 512;
        scene.add(dirLight);

        // Taza de café
        const cupGroup = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8efe0, roughness: 0.3, metalness: 0.1 });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 2.0, 32), bodyMat);
        body.castShadow = body.receiveShadow = true;
        cupGroup.add(body);

        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.15, 16, 32), bodyMat);
        handle.position.set(1.2, 0.15, 0);
        handle.rotation.z = Math.PI / 2;
        handle.castShadow = handle.receiveShadow = true;
        cupGroup.add(handle);

        const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3A1A10, roughness: 0.2 });
        const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 32), coffeeMat);
        coffee.position.y = 0.95;
        coffee.castShadow = coffee.receiveShadow = true;
        cupGroup.add(coffee);

        const rim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
        rim.position.y = 1.0;
        rim.rotation.x = Math.PI / 2;
        rim.castShadow = rim.receiveShadow = true;
        cupGroup.add(rim);

        const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32), bodyMat);
        plate.position.y = -1.05;
        plate.castShadow = plate.receiveShadow = true;
        cupGroup.add(plate);

        scene.add(cupGroup);

        // Granos de café
        const beanGroup = new THREE.Group();
        const beanGeo = new THREE.SphereGeometry(0.1, 6, 4);
        beanGeo.scale(1, 1, 0.6);
        const beanMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.7 });
        for (let i = 0; i < 20; i++) {
            const bean = new THREE.Mesh(beanGeo, beanMat);
            bean.position.set((Math.random() - 0.5) * 7, Math.random() * 5, (Math.random() - 0.5) * 5);
            bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            bean.userData = { rotSpeed: (Math.random() - 0.5) * 0.02, offset: Math.random() * 100 };
            beanGroup.add(bean);
        }
        scene.add(beanGroup);

        // Vapor
        const steamGroup = new THREE.Group();
        const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
        for (let i = 0; i < 40; i++) {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 3, 3), steamMat);
            p.position.set((Math.random() - 0.5) * 1.5, 1.0, (Math.random() - 0.5) * 1.5);
            p.userData = { speed: 0.01 + Math.random() * 0.02, life: Math.random(), max: 1.5 };
            steamGroup.add(p);
        }
        cupGroup.add(steamGroup);

        let targetRotY = 0;
        window.addEventListener('mousemove', (e) => {
            targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.5;
        });

        function animate() {
            requestAnimationFrame(animate);
            cupGroup.rotation.y += 0.004;
            camera.position.x += (targetRotY * 2 - camera.position.x) * 0.03;
            camera.lookAt(0, 0.5, 0);

            beanGroup.rotation.y += 0.001;
            beanGroup.children.forEach(b => {
                b.rotation.x += b.userData.rotSpeed;
                b.rotation.y += b.userData.rotSpeed * 0.5;
            });

            steamGroup.children.forEach(p => {
                p.position.y += p.userData.speed;
                p.userData.life += 0.01;
                p.material.opacity = 0.2 * (1 - p.userData.life / p.userData.max);
                if (p.position.y > 2.5 || p.userData.life >= p.userData.max) {
                    p.position.y = 1.0;
                    p.position.x = (Math.random() - 0.5) * 1.5;
                    p.position.z = (Math.random() - 0.5) * 1.5;
                    p.userData.life = 0;
                    p.material.opacity = 0.2;
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    } catch (e) {
        console.warn('Three.js no disponible, la escena 3D no se cargó.');
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initThreeScene);
else initThreeScene();
