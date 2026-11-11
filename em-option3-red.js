/* Recompose EM Tinting's existing site into the requested dark/red mockup.
   The original booking form, pricing logic, CRM calls and tint widget remain functional. */
(function(){
function build(){
const main=document.querySelector('main');const hero=document.querySelector('.hero');const trust=document.querySelector('.trust-strip');const book=document.querySelector('#book');if(!main||!hero||!trust||!book||document.querySelector('.em-option-film'))return;
const title=hero.querySelector('h1');if(title)title.innerHTML='PREMIUM TINT.<br><span>MAXIMUM COMFORT.</span>';
const copy=hero.querySelector('.hero-copy');if(copy)copy.textContent='Professional window tinting in Houston & Richmond using high-performance HITEK films. More privacy, less heat, and a cleaner look for your vehicle.';
const actions=hero.querySelector('.hero-actions');if(actions)actions.innerHTML='<a class="btn" href="#book">BOOK AN APPOINTMENT →</a><a class="text-link" href="#book">GET A QUOTE</a>';
const nav=document.querySelector('.site-header nav');if(nav)nav.innerHTML='<a href="#top">HOME</a><a href="#services">SERVICES</a><a href="#film">HITEK FILM</a><a href="#emTintVisualizer">TINT VISUALIZER</a><a href="#recent-work">OUR WORK</a><a href="#book">BOOK NOW</a>';
const headerBtn=document.querySelector('.site-header .btn-small');if(headerBtn){headerBtn.textContent='BOOK NOW';headerBtn.href='#book'}
trust.innerHTML='<span>Lifetime film warranty*</span><span>Heat rejection</span><span>UV protection</span><span>Premium HITEK films</span><span>Commercial & residential</span>';
const film=document.createElement('section');film.className='em-option-film';film.id='film-packages';film.innerHTML='<div class="em-option-film-brand"><b>HITEK</b><span>PREMIUM WINDOW FILMS</span></div><a href="#book"><span><strong>Carbon</strong><small>Classic look · Great value</small></span><em>$180+</em></a><a href="#book"><span><strong>Ceramic IR</strong><small>Enhanced heat rejection</small></span><em>$300+</em></a><a href="#book"><span><strong>Ceramic Plus</strong><small>Maximum comfort</small></span><em>$500+</em></a>';
const showcase=document.createElement('section');showcase.className='em-option-showcase';showcase.id='recent-work';showcase.innerHTML='<div class="em-option-gallery"><h2>OUR WORK</h2><div class="em-gallery-grid"><a href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener"><img src="media/hero-01.jpg" alt="EM Tinting work photo" loading="lazy"></a><a href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener"><img src="media/hero-02.jpg" alt="EM Tinting vehicle photo" loading="lazy"></a><a href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener"><img src="media/hero-03.jpg" alt="EM Tinting tint installation" loading="lazy"></a><a href="https://www.instagram.com/em_tinting/" target="_blank" rel="noopener"><img src="media/hero-04.jpg" alt="EM Tinting portfolio" loading="lazy"></a></div></div><div class="em-option-contact"><h2>READY TO BOOK YOUR TINT?</h2><a class="btn" href="#book">BOOK YOUR TINT TODAY →</a><p>Houston & Richmond, TX</p><p>Appointments: Monday–Saturday at 6:00 PM</p><p>Call or text: <a href="tel:+13468049135">346-804-9135</a></p></div>';
trust.insertAdjacentElement('afterend',film);
const shade=document.getElementById('emTintVisualizer');if(shade)film.insertAdjacentElement('beforebegin',shade);
film.insertAdjacentElement('afterend',showcase);
const services=document.getElementById('services');if(services){services.classList.add('em-option-old');services.insertAdjacentElement('beforebegin',showcase);showcase.insertAdjacentElement('beforebegin',film);if(shade)film.insertAdjacentElement('beforebegin',shade);}
// Hide long-form detail sections from homepage while retaining DOM for links and backend dependencies
for(const sel of ['.hitek-strip','#film','.film-feature','#compare','#why','.warranty-section','.cta-band','.faq'])document.querySelectorAll(sel).forEach(el=>el.classList.add('em-option-old'));
const old=document.querySelectorAll('.em-instagram-work');old.forEach(el=>{el.classList.add('em-option-old');if(el.id==='recent-work')el.id='recent-work-archive';});
const anchor=document.querySelector('.em-option-showcase');if(anchor&&book)anchor.insertAdjacentElement('afterend',book);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,0));else setTimeout(build,0);
})();