document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing ratings fetch...');

    const eleStars = document.getElementsByClassName('stars');

    for (const ele of eleStars) {
        const id = ele.dataset._id;

        try {
            const response = await fetch(`/api/ratings/${id}`);
            if (!response.ok) {
                throw new Error(`Error getting rating for product ${id}`);
            }

            const data = await response.json();
            const rating = data.rating.rate || 0;

            ele.innerHTML = generarEstrellas(rating);
        } catch (error) {
            console.error(`Error loading rating for product ${id}:`, error);
            ele.innerHTML = 'No rating available';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Adding click events to stars...');

    const eleStars = document.querySelectorAll('.stars-2 i');

    for (const star of eleStars) {
        star.addEventListener('click', Vota);
        console.log('Event added to star' + star);
    }
});

async function Vota(evt) {
    const target = evt.target;
    const id = target.dataset._id;
    const starValue = parseInt(target.dataset.star, 10);

    console.log(starValue);

    const starsContainer = target.parentElement;

    const originalContent = starsContainer.innerHTML;

    starsContainer.innerHTML = generarEstrellas2(starValue);

    try {
        const response = await fetch(`/api/ratings/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: starValue }),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);

        starsContainer.innerHTML = generarEstrellas2(data.rating.rate);

        const voteCountElement = document.querySelector(`.stars[data-_id="${id}"] + .text-muted`);
        if (voteCountElement) {
            voteCountElement.textContent = `(${data.rating.count} votes)`;
        }

    } catch (error) {
        console.error('Error al enviar calificación:', error);

        starsContainer.innerHTML = originalContent;

        for (const originalStar of starsContainer.children) {
            originalStar.addEventListener('click', Vota);
        }
    }
}

function generarEstrellas(rating) {
    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            estrellasHTML += '<i class="bi bi-star-fill" style="color: gold;"></i>';
        } else if (i - 0.5 <= rating) {
            estrellasHTML += '<i class="bi bi-star-half" style="color: gold;"></i>';
        } else {
            estrellasHTML += '<i class="bi bi-star" style="color: gold;"></i>';
        }
    }
    return estrellasHTML;
}

function generarEstrellas2(rating) {
    let estrellasHtml = '';
    estrellasHtml += `<strong id="rating-message">Thanks for voting!</strong>`
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            estrellasHtml += `<i class="bi bi-star-fill" data-star="${i}" style="color: gold;"></i>`;
        } else if (i - 1 < rating && rating < i) {
            estrellasHtml += `<i class="bi bi-star-half" data-star="${i}" style="color: gold;"></i>`;
        } else {
            estrellasHtml += `<i class="bi bi-star" data-star="${i}" style="color: gray;"></i>`;
        }
    }
    return estrellasHtml;
}

/*function generarEstrellas2(rating, maxStars = 5) {
    let estrellasHtml = '';
    estrellasHtml += `<strong id="rating-message">Thanks for voting!</strong>`
    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            estrellasHtml += `<i class="bi bi-star-fill" data-star="${i}" style="color: gold;"></i>`;
        } else {
            estrellasHtml += `<i class="bi bi-star" data-star="${i}" style="color: gray;"></i>`;
        }
    }
    return estrellasHtml;
}*/
