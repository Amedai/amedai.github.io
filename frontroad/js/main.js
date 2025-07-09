window.addEventListener('DOMContentLoaded', ()=>{
    const stageBlocks = document.querySelectorAll('.roadmap-stage__block');

    stageBlocks.forEach(block=>{
        const point = block.querySelector('.roadmap-stage__point');
        const modal = block.querySelector('.roadmap-stage__modal');
        const closeEl = block.querySelector('.roadmap-stage__modal-close');
        const title = block.querySelector('.roadmap-stage__modal-title');

        point.addEventListener('click', ()=>{
            title.textContent = point.textContent;
            modal.style.display = 'block';
        });

        closeEl.addEventListener('click',()=>{
            modal.style.display = 'none';
        });
        document.addEventListener('keydown',(e)=>{
            if(modal.style.display === 'block' && e.code == 'Escape'){
                console.log(1);
                modal.style.display = 'none';
            }
         });
    });
});