// --- CONFIGURAÇÃO PRINCIPAL ---
    const CONFIG = { 
        mainTopicId: 1, 
        topicDA: 2,  // Tópico do Departamento de Aplicação
        topicDRI: 3, // Tópico do Departamento de Relações Internacionais
        topicDM: 4,  // Tópico do Departamento Militar
        sheetUrl: "https://script.google.com/macros/s/AKfycbxxFGcukrz75Y80Dvlawthnbx1QnUUy-keqR6KAlNxQXeeUujKPi982bPTXlbyYfsIxuQ/exec",
        daSheetUrl: "https://script.google.com/macros/s/AKfycbw-NBtKacudTTa5aH-BhF_foiGa8_4IrWVtS8zVq7b8j0PkA8r-o8JaAUw5SrazJAFu/exec" 
    };
    
    // --- LINKS DE MP DO GITHUB ---
    const MP_LINKS = {
        entrada: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/mpentrada",
        saida: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/mpsa%C3%ADda",
        punicao: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/mppunicao",
        promo_mentor: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/promomentor",
        promo_cap: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/promocap",
        promo_grad: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/promograd",
        promo_est: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/promoest",
        promo_min: "https://raw.githubusercontent.com/BrendonMonteiro/mpteste/refs/heads/main/promomin"
    };

    const MP_DELAY = 5000; 
    let currentZoom = 1;

    // --- VARIÁVEL PARA CONTROLE DE TEMPO DO DA ---
    let daStartTime = null;

    // --- FUNÇÃO PARA ALTERNAR MODO DA (Entrada) ---
    function toggleDAOptions() {
        const checkbox = document.getElementById('check-membro-da');
        const wrapper = document.querySelector('.da-toggle-wrapper');
        const extraFields = document.getElementById('da-extra-fields');
        
        const nickInput = document.getElementById('entrada-nick-input');
        const aplicadorInput = document.getElementById('da-aplicador-input');
        const vereditoSelect = document.getElementById('da-veredito-select');

        if (checkbox.checked) {
            wrapper.classList.add('active');
            extraFields.classList.remove('hidden');
            setTimeout(() => { extraFields.classList.remove('opacity-0'); }, 10);
            
            nickInput.placeholder = "Nickname(s) do(s) participante(s)";
            if (!daStartTime) daStartTime = new Date().toLocaleString('pt-BR');
            
            aplicadorInput.setAttribute('required', 'true');
            vereditoSelect.setAttribute('required', 'true');

        } else {
            wrapper.classList.remove('active');
            extraFields.classList.add('opacity-0');
            setTimeout(() => { extraFields.classList.add('hidden'); }, 300);
            
            nickInput.placeholder = "Nickname (use / para múltiplos)";
            daStartTime = null;
            
            aplicadorInput.removeAttribute('required');
            vereditoSelect.removeAttribute('required');
            aplicadorInput.value = "";
            vereditoSelect.value = "";
        }
    }

    // --- FUNÇÕES PARA SUBGRUPOS (Licença) ---
    function toggleSubgroupOptions() {
        const checkbox = document.getElementById('check-subgrupo-licenca');
        const wrapper = document.querySelector('#form-licenca .da-toggle-wrapper');
        const container = document.getElementById('subgroup-options-container');

        if(checkbox.checked) {
            wrapper.classList.add('active');
            container.classList.remove('hidden');
            setTimeout(() => container.classList.remove('opacity-0'), 10);
        } else {
            wrapper.classList.remove('active');
            container.classList.add('opacity-0');
            setTimeout(() => container.classList.add('hidden'), 300);
            
            // Resetar seleções ao fechar
            document.querySelectorAll('.subgroup-selection-btn').forEach(btn => btn.classList.remove('selected'));
            document.getElementById('subgroup-permissions-list').innerHTML = '';
        }
    }

    function toggleSubgroupSelection(btn) {
        btn.classList.toggle('selected');
        const group = btn.dataset.group; // DA, DRI, DM
        const container = document.getElementById('subgroup-permissions-list');
        const inputId = `perm-input-${group}`;

        if (btn.classList.contains('selected')) {
            // Criar campo de permissão dinâmico
            const wrapper = document.createElement('div');
            wrapper.id = inputId;
            wrapper.className = "input-bar bg-amber-50/50 border-amber-100";
            wrapper.innerHTML = `
                <div class="input-icon-box text-amber-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></div>
                <input type="text" name="permissao_${group}" placeholder="Quem permitiu no ${group}?" class="input-field text-sm font-semibold text-amber-900 placeholder-amber-700/50" required>
            `;
            container.appendChild(wrapper);
        } else {
            // Remover campo se desmarcado
            const el = document.getElementById(inputId);
            if(el) el.remove();
        }
    }

    // --- FUNÇÃO PARA ENVIAR PARA A PLANILHA DO DA ---
    async function sendToLogDA(aplicador, horaInicial, participantes, veredito) {
        if (!CONFIG.daSheetUrl || CONFIG.daSheetUrl === "URL_DO_SEU_WEB_APP_DA_AQUI") {
            console.error("URL do Script DA não configurada.");
            return;
        }

        const payload = {
            aplicador: aplicador,
            horaInicial: horaInicial,
            participantes: participantes,
            veredito: veredito
        };

        try {
            await fetch(CONFIG.daSheetUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });
            console.log(`Dados enviados para Log DA: ${veredito}`);
        } catch (e) {
            console.error("Erro ao enviar Log DA:", e);
            throw new Error("Falha ao registrar Log do DA.");
        }
    }
    
    function toggleSettings() {
        const menu = document.getElementById('settings-menu');
        menu.classList.toggle('active');
    }
    
    function adjustZoom(delta) {
        currentZoom = Math.min(Math.max(currentZoom + delta, 0.8), 1.2);
        applyZoom();
    }
    
    function resetZoom() {
        currentZoom = 1;
        applyZoom();
    }
    
    function applyZoom() {
        document.getElementById('form-system-container').style.transform = `scale(${currentZoom})`;
        localStorage.setItem('wavex_zoom', currentZoom);
    }
    
    window.addEventListener('DOMContentLoaded', () => {
        const savedZoom = localStorage.getItem('wavex_zoom');
        if(savedZoom) {
            currentZoom = parseFloat(savedZoom);
            applyZoom();
        }

        document.querySelectorAll('.input-field').forEach(input => {
            if (input.nextElementSibling && input.nextElementSibling.classList.contains('add-nick-btn')) {
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault(); 
                        this.nextElementSibling.click(); 
                    }
                });
            }
        });
    });

    window.addEventListener('click', (e) => {
        const menu = document.getElementById('settings-menu');
        const trigger = document.getElementById('settings-trigger');
        if (!menu.contains(e.target) && !trigger.contains(e.target) && menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isDropdownOpen) toggleDropdown(false);
            
            selectedTextElem.textContent = 'Requerimentos';
            selectedIconElem.innerHTML = '<img src="https://2img.net/i.imgur.com/U9aXSQB.png" class="w-9 h-9 object-contain drop-shadow-sm" alt="Logo">';
            
            allForms.forEach(f => {
                f.style.opacity = '0';
                f.style.transform = 'translateY(10px)';
                setTimeout(() => f.classList.add('hidden'), 300);
            });
            formsContainer.classList.remove('open');
            document.getElementById('toast-container').innerHTML = '';
        }
    });

    window.addEventListener('load', () => {
        const loader = document.getElementById('tech-loader');
        setTimeout(() => {
            loader.classList.add('loaded');
            setTimeout(() => loader.remove(), 600);
        }, 1200);
    });

    const formSystemContainer = document.getElementById('form-system-container');
    const formsContainer = document.getElementById('forms-container');
    const headerPanel = document.getElementById('header-panel');
    const allForms = document.querySelectorAll('.form-panel');

    const dropdownButton = document.getElementById('custom-dropdown-button');
    const dropdownOptionsPanel = document.getElementById('custom-dropdown-options');
    const selectedTextElem = document.getElementById('custom-dropdown-selected-text');
    const selectedIconElem = document.getElementById('custom-dropdown-selected-icon');
    const dropdownChevron = document.getElementById('dropdown-chevron');

    let isDropdownOpen = false;

    function toggleDropdown(state) {
        isDropdownOpen = state !== undefined ? state : !isDropdownOpen;
        if(isDropdownOpen){
            dropdownOptionsPanel.classList.remove('hidden-style');
            dropdownOptionsPanel.classList.add('visible-style');
            dropdownChevron.style.transform = 'rotate(180deg)';
            dropdownButton.setAttribute('aria-expanded', 'true');
        } else {
            dropdownOptionsPanel.classList.remove('visible-style');
            dropdownOptionsPanel.classList.add('hidden-style');
            dropdownChevron.style.transform = 'rotate(0deg)';
            dropdownButton.setAttribute('aria-expanded', 'false');
        }
    }

    dropdownButton.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(); });
    window.addEventListener('click', () => toggleDropdown(false));

    document.querySelectorAll('.custom-dropdown-option').forEach(option => {
        option.addEventListener('click', () => {
            const val = option.dataset.value;
            const text = option.querySelector('span').textContent;
            
            const sourceIcon = option.querySelector('.option-icon-box').firstElementChild;
            const clonedIcon = sourceIcon.cloneNode(true);
            
            if (clonedIcon.tagName === 'IMG') {
                clonedIcon.setAttribute('class', 'w-9 h-9 object-contain drop-shadow-sm');
            } else {
                clonedIcon.setAttribute('class', 'w-7 h-7');
            }

            selectedTextElem.textContent = text;
            selectedIconElem.innerHTML = '';
            selectedIconElem.appendChild(clonedIcon);
            
            allForms.forEach(f => {
                f.style.opacity = '0';
                f.style.transform = 'translateY(10px)';
                setTimeout(() => f.classList.add('hidden'), 300);
            });
            formsContainer.classList.remove('open');

            document.getElementById('toast-container').innerHTML = '';

            if(val) {
                formsContainer.classList.add('open');
                setTimeout(() => {
                    const activeForm = document.getElementById(`form-${val}`);
                    if (activeForm) {
                        activeForm.classList.remove('hidden');
                        requestAnimationFrame(() => {
                            activeForm.style.opacity = '1';
                            activeForm.style.transform = 'translateY(0)';
                        });
                    }
                }, 350);

                setTimeout(() => {
                    if (val === 'licenca') {
                        showToast("Permissão Requerida", "A postagem deste requerimento exige, exclusivamente, a permissão de um <strong>Estagiário</strong> ou superior. Confira a veracidade.", "warning");
                    } else if (val === 'saida') {
                        showToast("Aviso Importante", "Verifique seu tempo na companhia. Caso tenha <strong>mais de 14 dias e menos de 30 dias</strong>, será punido com <strong>50 medalhas efetivas negativas</strong> por Saída Precoce.", "warning", 8000);
                    }
                }, 600);
            }
        });
    });

    function showToast(title, message, type = "info", duration = 6000) {
        const container = document.getElementById('toast-container');
        
        const colors = {
            warning: "bg-amber-50 border-amber-200 text-amber-800",
            danger: "bg-red-50 border-red-200 text-red-800",
            info: "bg-blue-50 border-blue-200 text-blue-800"
        };
        const iconColor = {
            warning: "text-amber-500",
            danger: "text-red-500",
            info: "text-blue-500"
        };
        const icons = {
            warning: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
            danger: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />', 
            info: '<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />'
        };

        const el = document.createElement('div');
        el.className = `p-4 rounded-2xl border shadow-lg backdrop-blur-md flex gap-3 transform transition-all duration-300 pointer-events-auto ${colors[type]} toast-enter`;
        el.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 shrink-0 ${iconColor[type]}">${icons[type]}</svg>
            <div class="flex-1">
                <h4 class="font-bold text-sm mb-1">${title}</h4>
                <p class="text-xs font-medium leading-relaxed opacity-90">${message}</p>
            </div>
            <button onclick="this.parentElement.classList.add('toast-exit-active'); setTimeout(()=>this.parentElement.remove(), 300)" class="shrink-0 text-current opacity-50 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
        `;

        container.appendChild(el);
        
        requestAnimationFrame(() => {
            el.classList.remove('toast-enter');
            el.classList.add('toast-enter-active');
        });

        setTimeout(() => {
            if(el.parentElement) {
                el.classList.remove('toast-enter-active');
                el.classList.add('toast-exit-active');
                setTimeout(() => el.remove(), 300);
            }
        }, duration);
    }

    async function updateAvatarIcon(input) {
        const nick = input.value.trim();
        const iconBox = input.previousElementSibling;
        if (!nick) return;

        try {
            const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${nick}`);
            if (response.ok) {
                const data = await response.json();
                if (data.uniqueId) {
                    const imgUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${data.name}&headonly=1`;
                    iconBox.innerHTML = `<img src="${imgUrl}" class="max-w-none" alt="">`;
                    iconBox.classList.add("overflow-hidden");
                }
            } else {
                showToast("Aviso", `Usuário <b>${nick}</b> não encontrado.`, "warning");
            }
        } catch (e) { console.error(e); }
    }

    /* --- LOGICA DE CHIPS E GRUPOS --- */
    async function verifyAndAddNickname(inputId, chipsContainerId, hiddenInputId, containerId, limit = 99, enableGroups = false) {
        const input = document.getElementById(inputId);
        const btn = input.nextElementSibling;
        const rawValue = input.value.trim();
        
        if (!rawValue) {
             showToast("Atenção", "O campo de Nickname não pode estar vazio.", "warning");
             return;
        }

        const originalIcon = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<svg class="spinner w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

        const segments = rawValue.split('/').map(n => n.trim()).filter(n => n.length > 0);
        let addedCount = 0; 

        if (limit === 1) {
            document.getElementById(chipsContainerId).innerHTML = '';
        }

        try {
            for (let segment of segments) {
                let nick = segment;
                let targetGroup = 1;

                if (segment.includes(':')) {
                    const parts = segment.split(':');
                    nick = parts[0].trim();
                    const parsedGroup = parseInt(parts[1]);
                    if (!isNaN(parsedGroup) && parsedGroup >= 1 && parsedGroup <= 4) {
                        targetGroup = parsedGroup;
                    }
                }

                const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${nick}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.uniqueId) {
                        if (addChip(data.name, chipsContainerId, hiddenInputId, containerId, limit, enableGroups, targetGroup)) {
                            addedCount++;
                        }
                    }
                } else {
                    showToast("Erro", `Usuário <b>${nick}</b> não encontrado.`, "danger");
                }
            }

            if (addedCount > 0) {
                input.value = '';
                showToast("Sucesso", `${addedCount} Nickname(s) adicionado(s).`, "info", 3000);
            } else if (segments.length > 0) {
                showToast("Aviso", "Nenhum nickname foi adicionado.", "warning", 3000);
            }
        } catch (error) {
            showToast("Erro de Conexão", "Falha ao verificar usuários na API.", "warning");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalIcon;
        }
    }

    function addChip(name, chipsContainerId, hiddenInputId, containerId, limit, enableGroups, initialGroup = 1) {
        const container = document.getElementById(chipsContainerId);
        
        const existing = Array.from(container.children).find(c => c.dataset.nick.toLowerCase() === name.toLowerCase());
        if(existing) return false;

        if (limit === 1 && container.children.length > 0) container.innerHTML = '';

        const chip = document.createElement('div');
        chip.className = 'nickname-chip';
        if (enableGroups) chip.classList.add('clickable');
        
        chip.dataset.nick = name;
        chip.dataset.group = String(initialGroup); 
        
        const imgUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${name}&headonly=1`;
        
        chip.innerHTML = `<img src="${imgUrl}" class="max-w-none" alt="">${name} <span class="remove-btn" onclick="event.stopPropagation(); removeChip(this, '${hiddenInputId}', '${containerId}', ${enableGroups})">✕</span>`;
        
        if(limit > 1 && enableGroups) {
            chip.onclick = () => {
                let currentGroup = parseInt(chip.dataset.group);
                let nextGroup = currentGroup + 1;
                if (nextGroup > 4) nextGroup = 1;
                chip.dataset.group = nextGroup;
                renderDynamicGroups(chipsContainerId, containerId);
            };
        }

        container.appendChild(chip);
        updateHiddenInput(hiddenInputId, chipsContainerId);
        if(limit > 1 && enableGroups) renderDynamicGroups(chipsContainerId, containerId);
        return true;
    }

    function removeChip(span, hiddenInputId, containerId, enableGroups) {
        const chip = span.parentElement;
        const chipsContainer = chip.parentElement;
        chip.remove();
        updateHiddenInput(hiddenInputId, chipsContainer.id);
        
        if(enableGroups && document.getElementById(containerId)) renderDynamicGroups(chipsContainer.id, containerId);
    }

    function updateHiddenInput(hiddenInputId, chipsContainerId) {
        const container = document.getElementById(chipsContainerId);
        const input = document.getElementById(hiddenInputId);
        const nicks = Array.from(container.children).map(c => c.dataset.nick);
        input.value = nicks.join(' / ');
    }

    function renderDynamicGroups(chipsContainerId, containerId) {
        const chipsContainer = document.getElementById(chipsContainerId);
        const targetContainer = document.getElementById(containerId);
        if(!targetContainer) return; 

        const chips = Array.from(chipsContainer.children);
        const groupsMap = {}; 
        chips.forEach(c => {
            const g = c.dataset.group;
            if(!groupsMap[g]) groupsMap[g] = [];
            groupsMap[g].push(c.dataset.nick);
        });

        const activeGroups = Object.keys(groupsMap).sort();

        Array.from(targetContainer.children).forEach(block => {
            if (!groupsMap[block.dataset.group]) block.remove();
        });

        activeGroups.forEach(groupId => {
            let block = targetContainer.querySelector(`.group-block[data-group="${groupId}"]`);
            if (!block) {
                block = document.createElement('div');
                block.className = 'group-block';
                block.dataset.group = groupId;
                
                const colors = { "1": "#79a8c3", "2": "#f472b6", "3": "#fb923c", "4": "#a78bfa" };
                const color = colors[groupId] || "#cbd5e1";

                let innerHTML = `
                    <div class="group-block-header" style="color: ${color}">
                        <span class="group-indicator" style="background: ${color}"></span>
                        GRUPO ${groupId} - Detalhes
                    </div>
                `;
                
                if (containerId === 'promocao-dynamic-fields') {
                    innerHTML += `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                        <div class="input-bar">
                            <div class="input-icon-box !mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></div>
                            <select name="cargo_atual_g${groupId}" class="input-field" required onchange="checkDemotion(this, '${groupId}')">
                                <option value="" disabled selected>Cargo Atual</option>
                                <option value="Professor(a)">Professor(a)</option>
                                <option value="Mentor(a)">Mentor(a)</option>
                                <option value="Capacitador(a)">Capacitador(a)</option>
                                <option value="Graduador(a)">Graduador(a)</option>
                                <option value="Estagiário(a)">Estagiário(a)</option>
                                <option value="Ministro">Ministro</option>
                                <option value="Vice-Líder">Vice-líder</option>
                                <option value="Líder">Líder</option>
                            </select>
                        </div>
                        <div class="input-bar">
                            <div class="input-icon-box !mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/></svg></div>
                            <select name="novo_cargo_g${groupId}" class="input-field" required onchange="checkDemotion(this, '${groupId}')">
                                <option value="" disabled selected>Novo Cargo</option>
                                <option value="Professor(a)">Professor(a)</option>
                                <option value="Mentor(a)">Mentor(a)</option>
                                <option value="Capacitador(a)">Capacitador(a)</option>
                                <option value="Graduador(a)">Graduador(a)</option>
                                <option value="Estagiário(a)">Estagiário(a)</option>
                                <option value="Ministro">Ministro</option>
                                <option value="Vice-Líder">Vice-líder</option>
                                <option value="Líder">Líder</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-2.5">
                        <div class="input-bar">
                             <div class="input-icon-box"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg></div>
                            <input type="date" name="data_g${groupId}" class="input-field" required>
                        </div>
                    </div>
                    <div>
                        <div class="input-bar textarea-bar">
                             <div class="input-icon-box pt-1 h-8"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg></div>
                            <textarea name="motivo_g${groupId}" class="textarea-field" placeholder="Motivo da alteração..." required></textarea>
                        </div>
                    </div>
                    <div id="proofs_container_g${groupId}" class="hidden flex flex-col gap-2 mt-2.5 bg-white/40 p-2 rounded-xl border border-white/50">
                        <span class="text-[10px] uppercase font-bold text-slate-500 ml-1">Comprovações Individuais (Rebaixamento)</span>
                        <div class="proofs-list-slot"></div>
                    </div>
                    `;

                } else if (containerId === 'advertencia-dynamic-fields') {
                    innerHTML += `
                    <div class="mb-2.5">
                        <div class="input-bar">
                            <div class="input-icon-box !mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /></svg></div>
                            <select name="tipo_g${groupId}" class="input-field" required>
                                <option value="" disabled selected>Tipo da Punição</option>
                                <option value="Erro">Erro</option>
                                <option value="Advertência Verbal">Advertência Verbal</option>
                                <option value="Advertência Interna">Advertência Interna</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div class="input-bar textarea-bar">
                             <div class="input-icon-box pt-1 h-8"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg></div>
                            <textarea name="motivo_g${groupId}" class="textarea-field" placeholder="Motivo(s) da advertência..." required></textarea>
                        </div>
                    </div>
                    <div id="proofs_container_g${groupId}" class="flex flex-col gap-2 mt-2.5 bg-white/40 p-2 rounded-xl border border-white/50">
                        <span class="text-[10px] uppercase font-bold text-slate-500 ml-1">Comprovações Individuais</span>
                        <div class="proofs-list-slot"></div>
                    </div>
                    `;
                } else {
                    const isExpulsao = containerId === 'expulsao-dynamic-fields';
                    
                    innerHTML += `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                        <div class="input-bar">
                            <div class="input-icon-box !mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                            <select name="cargo_g${groupId}" class="input-field" required>
                                <option value="" disabled selected>Cargo</option>
                                <option value="Professor(a)">Professor(a)</option>
                                <option value="Mentor(a)">Mentor(a)</option>
                                <option value="Capacitador(a)">Capacitador(a)</option>
                                <option value="Graduador(a)">Graduador(a)</option>
                                <option value="Estagiário(a)">Estagiário(a)</option>
                                <option value="Ministro">Ministro</option>
                                <option value="Vice-Líder">Vice-líder</option>
                                <option value="Líder">Líder</option>
                            </select>
                        </div>
                        <div class="input-bar textarea-bar">
                            <div class="input-icon-box pt-1 h-8"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg></div>
                            <textarea name="motivo_g${groupId}" class="textarea-field" placeholder="Motivo..." required></textarea>
                        </div>
                    </div>`;

                    if(isExpulsao) {
                        innerHTML += `
                        <div id="proofs_container_g${groupId}" class="flex flex-col gap-2 mt-0 bg-white/40 p-2 rounded-xl border border-white/50">
                            <span class="text-[10px] uppercase font-bold text-slate-500 ml-1">Comprovações Individuais</span>
                            <div class="proofs-list-slot"></div>
                        </div>`;
                    }
                }
                
                block.innerHTML = innerHTML;
                targetContainer.appendChild(block);
            }

            const proofsContainer = block.querySelector(`#proofs_container_g${groupId}`);
            if(proofsContainer) {
                const slot = proofsContainer.querySelector('.proofs-list-slot');
                const nicksInGroup = groupsMap[groupId];
                
                slot.innerHTML = ''; 

                nicksInGroup.forEach(nick => {
                    const safeNick = nick.replace(/[^a-zA-Z0-9]/g, '_'); 
                    const inputName = `comprovacoes_g${groupId}_${safeNick}`; 
                    
                    const imgUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${nick}&headonly=1&direction=2&head_direction=2&size=s`;

                    const row = document.createElement('div');
                    row.className = "flex items-center gap-2";
                    row.innerHTML = `
                        <div class="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/60 overflow-hidden">
                            <img src="${imgUrl}" class="opacity-80 grayscale-[30%]">
                        </div>
                        <div class="input-bar !h-[42px] !min-h-0 !p-0 !bg-white/70 w-full mb-1">
                             <input type="text" name="${inputName}" placeholder="Prova para ${nick}..." class="input-field !text-xs !px-3" required>
                        </div>
                    `;
                    slot.appendChild(row);
                });
            }
        });
        
        const blocks = Array.from(targetContainer.children);
        blocks.sort((a, b) => a.dataset.group - b.dataset.group);
        blocks.forEach(b => targetContainer.appendChild(b));
    }

    window.checkDemotion = function(selectElem, groupIdStr) {
        const block = selectElem.closest('.group-block');
        const cargoAtualSelect = block.querySelector(`[name="cargo_atual_g${groupIdStr}"]`);
        const novoCargoSelect = block.querySelector(`[name="novo_cargo_g${groupIdStr}"]`);
        const proofsContainer = block.querySelector(`#proofs_container_g${groupIdStr}`);

        if (!cargoAtualSelect || !novoCargoSelect || !proofsContainer) return;

        const hierarchy = {
            "Professor(a)": 1, "Mentor(a)": 2, "Capacitador(a)": 3, "Graduador(a)": 4,
            "Estagiário(a)": 5, "Ministro": 6, "Vice-Líder": 7, "Líder": 8
        };

        const currentVal = cargoAtualSelect.value;
        const newVal = novoCargoSelect.value;
        const inputs = proofsContainer.querySelectorAll('input');

        if (hierarchy[currentVal] && hierarchy[newVal]) {
            if (hierarchy[newVal] < hierarchy[currentVal]) {
                proofsContainer.classList.remove('hidden');
                proofsContainer.classList.add('flex');
                inputs.forEach(input => input.required = true);
            } else {
                proofsContainer.classList.add('hidden');
                proofsContainer.classList.remove('flex');
                inputs.forEach(input => {
                    input.required = false;
                    input.value = "";
                });
            }
        }
    };

    const rangeInput = document.getElementById('licenca-dias');
    const badge = document.getElementById('licenca-duration-badge');
    const helper = document.getElementById('licenca-duration-helper');
    if(rangeInput) {
        rangeInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            badge.textContent = `${val} dias`;
            document.getElementById('licenca-duration-label').textContent = `Tipo: ${val <= 30 ? 'Licença' : 'Reserva'}`;
            const date = new Date(); date.setDate(date.getDate() + val);
            helper.innerHTML = `Retorno previsto em: <strong>${date.toLocaleDateString('pt-BR')}</strong>`;
        });
        const initialVal = parseInt(rangeInput.value);
        const initialDate = new Date(); initialDate.setDate(initialDate.getDate() + initialVal);
        helper.innerHTML = `Retorno previsto em: <strong>${initialDate.toLocaleDateString('pt-BR')}</strong>`;
    }

    function generateSingleBBCode(title, content) {
        return `[center][b][size=16]${title}[/size][/b][/center]\n\n${content}`;
    }

    function generatePostQueue(formId, formData, formElement) {
        let title = selectedTextElem.textContent; 
        const queue = [];
        const todayStr = new Date().toLocaleDateString('pt-BR');

        if (formId === 'form-advertencia') return [];

        if (formId === 'form-atualizacao') {
             const tag = formData.get('nickname') || "Atualização";
             const bbcode = `[font=Poppins][center][table style="border: none!important; overflow: hidden; border-radius: 15px; line-height: 1em; width: 65%" bgcolor="93b8d3"]` +
                    `[tr style="border: none!important; overflow: hidden"]` +
                    `[td style="border: none!important; overflow: hidden"]` +
                    `[img(18px,18px)]https://2img.net/i.imgur.com/qmLa772.png[/img]\n\n` +
                    `[img]https://2img.net/i.imgur.com/qz9m2VC.png[/img]\n` +                    
                    `[color=white][size=18][b][EFE] Atualização realizada! [${tag}] [/size][/b]\n` +
                    `[size=11]Em caso de dúvidas ou erros, entre em contato com um Estagiário+ da companhia.[/color][/size]\n\n`+
                    `[url=https://www.policiarcc.com/t31424-efe-lista-de-membros][size=11][b][color=white]ACESSAR A LISTAGEM DE MEMBROS[/color][/b][/size][/url]\n` +
                    `[/td][/tr][/table][/center][/font]`;
             queue.push({ id: 'atualizacao', bbcode });
             return queue;
        }

        if (['form-saida', 'form-expulsao', 'form-promocao'].includes(formId)) {
            const chipsContainer = formElement.querySelector('.nickname-chips-container');
            const chips = Array.from(chipsContainer.children);
            const permissao = formData.get('permissao');
            const termo = formData.get('termo') ? 'Concordo com todos os termos relacionados à saída da companhia.' : 'Não aceito (ERRO)';

            const groups = {};
            chips.forEach(chip => {
                const gId = chip.dataset.group;
                if(!groups[gId]) groups[gId] = [];
                groups[gId].push(chip.dataset.nick);
            });

            Object.keys(groups).sort().forEach(gId => {
                const nicks = groups[gId];
                const joinedNicks = nicks.join(' / '); 
                
                let groupContent = "";
                let dynamicTitle = title; 

                if (formId === 'form-promocao') {
                    const cargoAtual = formElement.querySelector(`[name="cargo_atual_g${gId}"]`)?.value || "Não informado";
                    const novoCargo = formElement.querySelector(`[name="novo_cargo_g${gId}"]`)?.value || "Não informado";
                    const dataRaw = formElement.querySelector(`[name="data_g${gId}"]`)?.value;
                    const data = dataRaw ? new Date(dataRaw).toLocaleDateString('pt-BR') : "Não informado";
                    const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "Não informado";
                    
                    const hierarchy = {
                        "Professor(a)": 1, "Mentor(a)": 2, "Capacitador(a)": 3, "Graduador(a)": 4,
                        "Estagiário(a)": 5, "Ministro": 6, "Vice-Líder": 7, "Líder": 8
                    };
                    
                    const oldRank = hierarchy[cargoAtual] || 0;
                    const newRank = hierarchy[novoCargo] || 0;
                    
                    if (newRank > oldRank) dynamicTitle = "Promoção";
                    else if (newRank < oldRank) dynamicTitle = "Rebaixamento";
                    else dynamicTitle = "Alteração de Cargo";

                    groupContent += `[b]Nickname(s):[/b] ${joinedNicks}\n`;
                    groupContent += `[b]Cargo atual:[/b] ${cargoAtual}\n`;
                    groupContent += `[b]Novo cargo:[/b] ${novoCargo}\n`;
                    groupContent += `[b]Motivo(s):[/b] ${motivo}\n`;
                    groupContent += `[b]Data:[/b] ${data}\n`;

                } else if (formId === 'form-saida' || formId === 'form-expulsao') {
                    const cargo = formElement.querySelector(`[name="cargo_g${gId}"]`)?.value || "Não informado";
                    const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "Não informado";
                    
                    groupContent += `[b]Nickname(s):[/b] ${joinedNicks}\n`;
                    groupContent += `[b]Cargo:[/b] ${cargo}\n`;
                    groupContent += `[b]Motivo(s):[/b] ${motivo}\n`;
                    groupContent += `[b]Permissão:[/b] ${permissao}\n`;
                    groupContent += `[b]Data:[/b] ${todayStr}\n`;

                    if(formId === 'form-saida') {
                        groupContent += `\n✓ ${termo}\n`;
                    }
                }

                queue.push({
                    id: `${dynamicTitle} - Grupo ${gId}`,
                    bbcode: generateSingleBBCode(dynamicTitle, groupContent)
                });
            });

        } else {
            const nick = formData.get('nickname');
            
            if (formId === 'form-entrada' || formId === 'form-reintegracao') {
                let finalContent = `[b]Nickname(s):[/b] ${nick}\n`;
                if(formId === 'form-reintegracao') {
                     finalContent += `[b]Necessita Graduação:[/b] ${formData.get('graduacao')}\n`;
                     title = "Reintegração";
                }
                finalContent += `[b]Data:[/b] ${todayStr}\n`;

                queue.push({
                    id: formId === 'form-entrada' ? 'Entrada Coletiva' : 'Reintegração',
                    bbcode: generateSingleBBCode(title, finalContent)
                });
            } else {
                let content = "";
                let dynamicTitle = title;
                
                if (formId === 'form-licenca') {
                    const dias = parseInt(formData.get('dias'));
                    dynamicTitle = dias <= 30 ? "Licença" : "Reserva";
                }
                
                let commonPart = getCommonFieldsBBCode(formId, formData);

                if(nick && nick.includes('/')) {
                    const nickList = nick.split('/').map(n => n.trim());
                    nickList.forEach(n => {
                        let finalContent = `[b]Nickname:[/b] ${n}\n`;

                        if (formId === 'form-licenca') {
                            const dias = formData.get('dias');
                            const permissao = formData.get('permissao');
                            const dataRetorno = new Date();
                            dataRetorno.setDate(dataRetorno.getDate() + parseInt(dias));
                            const dataRetornoStr = dataRetorno.toLocaleDateString('pt-BR');

                            finalContent += `[b]Duração:[/b] ${dias} dias\n`;
                            finalContent += `[b]Solicitada em:[/b] ${todayStr}\n`;
                            finalContent += `[b]Retorno em:[/b] ${dataRetornoStr}\n`;
                            finalContent += `[b]Permissão:[/b] ${permissao}\n`;
                        } else if (formId === 'form-retorno_licenca') {
                            finalContent += `[b]Data:[/b] ${todayStr}\n`;
                        } else {
                            finalContent += commonPart;
                            finalContent += `[b]Data:[/b] ${todayStr}\n`;
                        }
                        
                        queue.push({ id: n, bbcode: generateSingleBBCode(dynamicTitle, finalContent) });
                    });
                } else if (nick) {
                    let finalContent = `[b]Nickname:[/b] ${nick}\n`;
                    
                    if (formId === 'form-licenca') {
                        const dias = formData.get('dias');
                        const permissao = formData.get('permissao');
                        const dataRetorno = new Date();
                        dataRetorno.setDate(dataRetorno.getDate() + parseInt(dias));
                        const dataRetornoStr = dataRetorno.toLocaleDateString('pt-BR');

                        finalContent += `[b]Duração:[/b] ${dias} dias\n`;
                        finalContent += `[b]Solicitada em:[/b] ${todayStr}\n`;
                        finalContent += `[b]Retorno em:[/b] ${dataRetornoStr}\n`;
                        finalContent += `[b]Permissão:[/b] ${permissao}\n`;
                    } else if (formId === 'form-retorno_licenca') {
                        finalContent += `[b]Data:[/b] ${todayStr}\n`;
                    } else {
                        finalContent += commonPart;
                        finalContent += `[b]Data:[/b] ${todayStr}\n`;
                    }

                    queue.push({
                        id: 'Único',
                        bbcode: generateSingleBBCode(dynamicTitle, finalContent)
                    });
                } else {
                     queue.push({
                        id: 'Único',
                        bbcode: generateSingleBBCode(dynamicTitle, commonPart + `[b]Data:[/b] ${todayStr}\n`)
                    });
                }
            }
        }

        return queue;
    }

    function getCommonFieldsBBCode(formId, formData) {
        let text = "";
        if (formId === 'form-transferencia') text += `[b]Nickname Atual:[/b] ${formData.get('nickname_atual')}\n[b]Novo Nickname:[/b] ${formData.get('nickname_novo')}\n`;
        else if (formId === 'form-migracao') text += `[b]Para:[/b] ${formData.get('corpo_destino')}\n`;
        else if (formId === 'form-prolongamento') text += `[b]Dias Adicionais:[/b] ${formData.get('dias')}\n`;
        return text;
    }

    async function sendToSheet(formId, formData, formElement) {
        if (!CONFIG.sheetUrl) return;

        const timestamp = new Date().toLocaleString('pt-BR');
        let sheetName = "";
        let rows = [];

        if (formId === 'form-entrada') {
            sheetName = "Entrada";
            const nicks = formData.get('nickname').split('/').map(n => n.trim()).filter(n => n);
            nicks.forEach(nick => rows.push([timestamp, nick]));

        } else if (formId === 'form-saida') {
            sheetName = "Saída";
            const chips = Array.from(formElement.querySelector('.nickname-chips-container').children);
            const permissao = formData.get('permissao');
            const groups = {};
            chips.forEach(chip => {
                const gId = chip.dataset.group;
                if(!groups[gId]) groups[gId] = [];
                groups[gId].push(chip.dataset.nick);
            });
            Object.keys(groups).sort().forEach(gId => {
                const cargo = formElement.querySelector(`[name="cargo_g${gId}"]`)?.value || "";
                const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
                groups[gId].forEach(nick => rows.push([timestamp, nick, cargo, motivo, permissao]));
            });

        } else if (formId === 'form-expulsao') {
            sheetName = "Expulsão";
            const chips = Array.from(formElement.querySelector('.nickname-chips-container').children);
            const permissao = formData.get('permissao');
            const groups = {};
            chips.forEach(chip => {
                const gId = chip.dataset.group;
                if(!groups[gId]) groups[gId] = [];
                groups[gId].push(chip.dataset.nick);
            });
            Object.keys(groups).sort().forEach(gId => {
                const cargo = formElement.querySelector(`[name="cargo_g${gId}"]`)?.value || "";
                const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
                groups[gId].forEach(nick => {
                    const safeNick = nick.replace(/[^a-zA-Z0-9]/g, '_');
                    const comp = formData.get(`comprovacoes_g${gId}_${safeNick}`) || "";
                    rows.push([timestamp, nick, cargo, motivo, permissao, comp]);
                });
            });

        } else if (formId === 'form-promocao') {
            sheetName = "Promoção";
            const chips = Array.from(formElement.querySelector('.nickname-chips-container').children);
            const groups = {};
            chips.forEach(chip => {
                const gId = chip.dataset.group;
                if(!groups[gId]) groups[gId] = [];
                groups[gId].push(chip.dataset.nick);
            });
            const hierarchy = { "Professor(a)": 1, "Mentor(a)": 2, "Capacitador(a)": 3, "Graduador(a)": 4, "Estagiário(a)": 5, "Ministro": 6, "Vice-Líder": 7, "Líder": 8 };

            Object.keys(groups).sort().forEach(gId => {
                const cargoAtual = formElement.querySelector(`[name="cargo_atual_g${gId}"]`)?.value || "";
                const novoCargo = formElement.querySelector(`[name="novo_cargo_g${gId}"]`)?.value || "";
                const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
                const dataRaw = formElement.querySelector(`[name="data_g${gId}"]`)?.value;
                const data = dataRaw ? new Date(dataRaw).toLocaleDateString('pt-BR') : "";
                
                const oldRank = hierarchy[cargoAtual] || 0;
                const newRank = hierarchy[novoCargo] || 0;
                let tipo = "Alteração";
                if(newRank > oldRank) tipo = "Promoção";
                else if(newRank < oldRank) tipo = "Rebaixamento";

                groups[gId].forEach(nick => {
                    const safeNick = nick.replace(/[^a-zA-Z0-9]/g, '_');
                    const comp = formData.get(`comprovacoes_g${gId}_${safeNick}`) || "";
                    rows.push([timestamp, tipo, nick, novoCargo, motivo, data, comp]);
                });
            });

        } else if (formId === 'form-advertencia') {
            sheetName = "Advertência";
            const chips = Array.from(formElement.querySelector('.nickname-chips-container').children);
            const permissao = formData.get('permissao');
            const groups = {};
            chips.forEach(chip => {
                const gId = chip.dataset.group;
                if(!groups[gId]) groups[gId] = [];
                groups[gId].push(chip.dataset.nick);
            });
            
            const today = new Date();
            today.setDate(today.getDate() + 30);
            const dataTermino = today.toLocaleDateString('pt-BR');

            Object.keys(groups).sort().forEach(gId => {
                const tipo = formElement.querySelector(`[name="tipo_g${gId}"]`)?.value || "";
                const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
                
                groups[gId].forEach(nick => {
                    const safeNick = nick.replace(/[^a-zA-Z0-9]/g, '_');
                    const comp = formData.get(`comprovacoes_g${gId}_${safeNick}`) || "";
                    rows.push([timestamp, nick, tipo, motivo, dataTermino, comp, permissao]);
                });
            });
        }    else if (formId === 'form-transferencia') {
            sheetName = "Transferência";
            rows.push([timestamp, formData.get('nickname_atual'), formData.get('nickname_novo')]);

        } else if (formId === 'form-retorno_licenca') {
            sheetName = "Retorno";
            rows.push([timestamp, formData.get('nickname')]);

        } else if (formId === 'form-reintegracao') {
            sheetName = "Reintegração";
            rows.push([timestamp, formData.get('nickname'), formData.get('graduacao')]);

        } else if (formId === 'form-migracao') {
            sheetName = "Migração";
            rows.push([timestamp, formData.get('nickname'), formData.get('corpo_destino')]);

        } else if (formId === 'form-prolongamento') {
            sheetName = "Prolongamento";
            rows.push([timestamp, formData.get('nickname'), formData.get('dias')]);

        } else if (formId === 'form-licenca') {
            sheetName = "Licença";
            const nick = formData.get('nickname');
            const dias = parseInt(formData.get('dias'));
            const permissao = formData.get('permissao');

            const tipo = dias <= 30 ? "Licença" : "Reserva";
            const dataRetornoObj = new Date();
            dataRetornoObj.setDate(dataRetornoObj.getDate() + dias);
            const retorno = dataRetornoObj.toLocaleDateString('pt-BR');

            const nicks = nick.split('/').map(n => n.trim()).filter(n => n);
            
            nicks.forEach(n => {
                 rows.push([timestamp, tipo, n, dias, retorno, permissao]);
            });
        }

        if (!sheetName || rows.length === 0) return;

        try {
            await fetch(CONFIG.sheetUrl, {
                method: "POST",
                mode: "no-cors", 
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ sheet: sheetName, rows: rows })
            });
            console.log(`Dados enviados para a aba ${sheetName}`);
        } catch (e) { console.error("Erro ao enviar para planilha:", e); }
    }

    function newestUrl(topicId) {
        return `${window.location.protocol}//${window.location.host}/t${topicId}-?view=newest`;
    }

    async function postToForumTopic(topicId, bbcodeMessage) {
        const replyUrl = `/post?mode=reply&t=${encodeURIComponent(topicId)}&_t=${Date.now()}`;
        const replyPage = await fetch(replyUrl, { credentials: 'same-origin', headers: { 'Cache-Control': 'no-store, no-cache' }});
        if (!replyPage.ok) throw new Error(`Falha ao abrir resposta (status ${replyPage.status})`);
        
        const html = await replyPage.text();
        const dom = new DOMParser().parseFromString(html, 'text/html');
        let form = dom.querySelector('form textarea[name="message"]')?.closest('form');
        
        if (!form) {
            const errorMsg = dom.body.innerText;
            if (errorMsg.includes("flood") || errorMsg.includes("mensagens")) throw new Error('Flood Control detectado: Aguarde.');
            throw new Error('Formulário não encontrado.');
        }

        const formData = new FormData();
        form.querySelectorAll('input, textarea, select').forEach(el => {
            const name = el.getAttribute('name');
            if (!name) return;
            if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
            if (el.tagName.toLowerCase() === 'textarea' && name === 'message') return; 
            formData.append(name, el.value || '');
        });

        formData.set('message', bbcodeMessage);
        if (!formData.has('post')) formData.set('post', '1');
        if (!formData.has('mode')) formData.set('mode', 'reply');
        if (!formData.has('t')) formData.set('t', String(topicId));

        const action = form.getAttribute('action') || '/post';
        const postResp = await fetch(action, { method: 'POST', body: formData, credentials: 'same-origin' });
        if (!postResp.ok) throw new Error(`Erro no servidor (status ${postResp.status}).`);
    }

    async function fetchGitHubContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao baixar modelo de MP");
            return await response.text();
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function prepareMPData(formId, nick, formData, formElement) {
        let githubUrl = "";
        let replacements = {}; 
        let subject = "";

        const today = new Date();
        const next30Days = new Date(); 
        next30Days.setDate(today.getDate() + 30);
        const dataTerminoStr = next30Days.toLocaleDateString('pt-BR');

        const safeNick = nick.replace(/[^a-zA-Z0-9]/g, '_');
        const chip = Array.from(formElement.querySelectorAll('.nickname-chip')).find(c => c.dataset.nick === nick);
        let gId = chip ? chip.dataset.group : null;

        if (formId === 'form-advertencia' && gId) {
            githubUrl = MP_LINKS.punicao;
            subject = "[EFE] Advertência";
            
            const tipo = formElement.querySelector(`[name="tipo_g${gId}"]`)?.value || "";
            const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
            const comp = formData.get(`comprovacoes_g${gId}_${safeNick}`) || "N/A";

            replacements['{tipo}'] = tipo;
            replacements['{motivo}'] = motivo;
            replacements['{comprovacoes}'] = comp; 
            replacements['{termino}'] = dataTerminoStr;
        }
        else if (formId === 'form-expulsao' && gId) {
            githubUrl = MP_LINKS.punicao;
            subject = "[EFE] Expulsão";
            
            const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
            const comp = formData.get(`comprovacoes_g${gId}_${safeNick}`) || "N/A";
            
            replacements['{tipo}'] = "Expulsão";
            replacements['{motivo}'] = motivo;
            replacements['{comprovacoes}'] = comp; 
            replacements['{termino}'] = dataTerminoStr;
        }
        else if (formId === 'form-promocao' && gId) {
            const cargoAtual = formElement.querySelector(`[name="cargo_atual_g${gId}"]`)?.value;
            const novoCargo = formElement.querySelector(`[name="novo_cargo_g${gId}"]`)?.value;
            
            const hierarchy = { "Professor(a)": 1, "Mentor(a)": 2, "Capacitador(a)": 3, "Graduador(a)": 4, "Estagiário(a)": 5, "Ministro": 6 };
            const oldRank = hierarchy[cargoAtual] || 0;
            const newRank = hierarchy[novoCargo] || 0;

            if (newRank < oldRank) {
                githubUrl = MP_LINKS.punicao;
                subject = "[EFE] Rebaixamento";
                const motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";
                const comp = formData.get(`comprovacoes_g${gId}_${safeNick}`) || "N/A";
                
                replacements['{tipo}'] = "Rebaixamento";
                replacements['{motivo}'] = motivo;
                replacements['{comprovacoes}'] = comp; 
                replacements['{termino}'] = dataTerminoStr;

            } else {
                subject = "[EFE] Promoção";
                if (cargoAtual === "Professor(a)" && novoCargo === "Mentor(a)") githubUrl = MP_LINKS.promo_mentor;
                else if (cargoAtual === "Mentor(a)" && novoCargo === "Capacitador(a)") githubUrl = MP_LINKS.promo_cap;
                else if (cargoAtual === "Capacitador(a)" && novoCargo === "Graduador(a)") githubUrl = MP_LINKS.promo_grad;
                else if (cargoAtual === "Graduador(a)" && novoCargo === "Estagiário(a)") githubUrl = MP_LINKS.promo_est;
                else if (cargoAtual === "Estagiário(a)" && novoCargo === "Ministro") githubUrl = MP_LINKS.promo_min;
                else return null; 
            }
        }
        else if (formId === 'form-entrada' || formId === 'form-reintegracao') {
             githubUrl = MP_LINKS.entrada;
             subject = "[EFE] Entrada/Reintegração";
        }
        else if (formId === 'form-saida') {
             githubUrl = MP_LINKS.saida;
             subject = "[EFE] Saída";
        }
        else {
            return null;
        }

        if(!githubUrl) return null;

        let content = await fetchGitHubContent(githubUrl);
        if(!content) return null;

        for (const [key, value] of Object.entries(replacements)) {
            content = content.split(key).join(value);
        }

        return { subject, message: content };
    }

    async function sendPrivateMessage(username, subject, message) {
        try {
            const composeResp = await fetch('/privmsg?mode=post', { credentials: 'same-origin', headers: { 'Cache-Control': 'no-store, no-cache' } });
            if (!composeResp.ok) return false;

            const html = await composeResp.text();
            const dom = new DOMParser().parseFromString(html, 'text/html');
            const form = dom.querySelector('form textarea[name="message"]')?.closest('form');
            if (!form) return false;

            const formData = new FormData();
            let hasUsernameArrayField = false;

            form.querySelectorAll('input, textarea, select').forEach(el => {
                const name = el.getAttribute('name');
                if (!name || name === 'message' || name === 'subject') return;
                if (name === 'username[]') hasUsernameArrayField = true;
                if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
                formData.append(name, el.value || '');
            });

            if (hasUsernameArrayField) formData.set('username[]', username);
            else formData.set('username', username);

            formData.set('subject', subject);
            formData.set('message', message);
            if (!formData.has('post')) formData.set('post', '1');

            const action = form.getAttribute('action') || '/privmsg';
            const sendResp = await fetch(action, { method: 'POST', body: formData, credentials: 'same-origin' });
            
            if (!sendResp.ok) return false;
            const textLower = (await sendResp.text()).toLowerCase();
            if (textLower.includes('não existe') || textLower.includes('flood')) return false;

            console.log(`MP enviada para: ${username}`);
            return true;
        } catch (error) { return false; }
    }

    function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    allForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!form.checkValidity()) { form.reportValidity(); return; }
            
            const chipsContainer = form.querySelector('.nickname-chips-container');
            const requiredNicknames = ['form-entrada', 'form-saida', 'form-expulsao', 'form-promocao', 'form-advertencia'];
            if (chipsContainer && requiredNicknames.includes(form.id) && chipsContainer.children.length === 0) {
                 showNotificationError("Campo de nickname vazio!", "Adicione pelo menos um nickname.");
                 return;
            }

            const btn = form.querySelector('.submit-button-rect');
            const btnText = btn.querySelector('span');
            const btnIcon = btn.querySelector('svg:not(.spinner)');
            const spinner = btn.querySelector('.spinner');
            const originalText = btnText.textContent;

            btn.disabled = true;
            if(btnIcon) btnIcon.classList.add('hidden');
            if(spinner) spinner.classList.remove('hidden');

            try {
                const formData = new FormData(form);
                
                // --- LÓGICA ESPECÍFICA DO MODO DA (Entrada) ---
                if (form.id === 'form-entrada' && document.getElementById('check-membro-da').checked) {
                    const aplicador = document.getElementById('da-aplicador-input').value;
                    const veredito = document.getElementById('da-veredito-select').value;
                    const participantes = formData.get('nickname'); // Já formatado
                    
                    await sendToLogDA(aplicador, daStartTime, participantes, veredito);

                    if (veredito === "Reprovado(a)") {
                        showNotificationSuccess("Registrado", "Reprovação registrada.", false);
                        
                        btn.disabled = false;
                        btnText.textContent = originalText;
                        if(btnIcon) btnIcon.classList.remove('hidden');
                        if(spinner) spinner.classList.add('hidden');
                        return; 
                    }
                }
                
                // 1. Planilha Normal
                sendToSheet(form.id, formData, form);

                handlePunishmentTabs(form.id, form);
                
                // 2. MPs (GitHub Content)
                const mpForms = ['form-entrada', 'form-saida', 'form-expulsao', 'form-promocao', 'form-advertencia', 'form-reintegracao'];
                
                if (mpForms.includes(form.id)) {
                    btnText.textContent = "PROCESSANDO MP'S...";
                    let nicksToSend = [];

                    if (['form-saida', 'form-expulsao', 'form-promocao', 'form-advertencia'].includes(form.id)) {
                        const chips = Array.from(form.querySelector('.nickname-chips-container').children);
                        nicksToSend = chips.map(c => c.dataset.nick);
                    } else {
                        const rawNick = formData.get('nickname');
                        if (rawNick) nicksToSend = rawNick.split('/').map(n => n.trim()).filter(n => n);
                    }

                    for (let i = 0; i < nicksToSend.length; i++) {
                        const nick = nicksToSend[i];
                        btnText.textContent = `MP (${i+1}/${nicksToSend.length}): ${nick}`;

                        const template = await prepareMPData(form.id, nick, formData, form);
                        
                        if (template) {
                            const success = await sendPrivateMessage(nick, template.subject, template.message);
                            if (!success) showToast("Erro MP", `Falha ao enviar para ${nick}.`, "danger", 3000);
                            if (i < nicksToSend.length - 1) await delay(MP_DELAY); 
                        }
                    }
                }

                // 3. Postar no Fórum (COM LÓGICA DE SUBGRUPOS)
                if (form.id !== 'form-advertencia') {
                    const queue = generatePostQueue(form.id, formData, form);
                    
                    // Verifica subgrupos ativos apenas se for licença
                    let subgruposParaPostar = [];
                    if (form.id === 'form-licenca' && document.getElementById('check-subgrupo-licenca').checked) {
                        const selectedButtons = document.querySelectorAll('#subgroup-options-container .subgroup-selection-btn.selected');
                        selectedButtons.forEach(b => {
                            const groupName = b.dataset.group;
                            const configKey = "topic" + groupName;
                            subgruposParaPostar.push({
                                id: CONFIG[configKey],
                                name: groupName
                            });
                        });
                    }

                    for (let i = 0; i < queue.length; i++) {
                        const item = queue[i];
                        
                        // Postagem Principal (Usa BBCode original gerado, com permissão original)
                        btnText.textContent = `POSTANDO ${item.id.toUpperCase()}...`;
                        showNotificationProgress("Processando...", `Enviando postagem do <strong>${item.id}</strong> (Tópico Principal)...`);
                        await postToForumTopic(CONFIG.mainTopicId, item.bbcode);
                        
                        // Postagens em Subgrupos (Loop Extra)
                        if (subgruposParaPostar.length > 0) {
                            for (let s = 0; s < subgruposParaPostar.length; s++) {
                                const sub = subgruposParaPostar[s];
                                
                                // Captura a permissão específica deste subgrupo
                                const specificPerm = formData.get(`permissao_${sub.name}`);
                                
                                // Substitui a permissão no BBCode original (Troca [b]Permissão:[/b] X por [b]Permissão:[/b] Y)
                                let specificBBCode = item.bbcode;
                                if(specificPerm) {
                                     specificBBCode = specificBBCode.replace(/\[b\]Permissão:\[\/b\] .+/g, `[b]Permissão:[/b] ${specificPerm}`);
                                     // Caso o formato não tenha espaço
                                     specificBBCode = specificBBCode.replace(/\[b\]Permissão:\[\/b\].*?\n/g, `[b]Permissão:[/b] ${specificPerm}\n`);
                                }

                                await delay(2500); 
                                btnText.textContent = `POSTANDO EM ${sub.name}...`;
                                showNotificationProgress("Processando...", `Enviando postagem para <strong>${sub.name}</strong>...`);
                                await postToForumTopic(sub.id, specificBBCode);
                            }
                        }

                        if (i < queue.length - 1) await delay(4500); 
                    }
                    showNotificationSuccess("Sucesso!", "Requerimentos processados.", true);
                } else {
                    showNotificationSuccess("Sucesso!", "Advertência registrada (MP + Planilha).", false);
                }
                
                const btnConfira = document.getElementById('confira-post-btn');
                btnConfira.onclick = () => { window.location.href = newestUrl(CONFIG.mainTopicId); };

            } catch (error) {
                console.error("Erro:", error);
                showNotificationError("Falha", error.message);
            } finally {
                btn.disabled = false;
                btnText.textContent = originalText;
                if(btnIcon) btnIcon.classList.remove('hidden');
                if(spinner) spinner.classList.add('hidden');
            }
        });
    });

    function showNotificationProgress(title, msg) {
        const overlay = document.getElementById('notification-overlay');
        const panel = document.getElementById('notification-panel');
        const iconContainer = document.getElementById('notification-icon-container');
        const actions = document.getElementById('notification-actions');
        
        iconContainer.className = "w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2";
        iconContainer.innerHTML = `<svg class="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').innerHTML = msg; 
        actions.classList.add('hidden'); 
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        setTimeout(() => panel.classList.remove('scale-95', 'opacity-0'), 100);
    }

    function showNotificationSuccess(title, msg, showLink = true) {
        const overlay = document.getElementById('notification-overlay');
        const panel = document.getElementById('notification-panel');
        const iconContainer = document.getElementById('notification-icon-container');
        const actions = document.getElementById('notification-actions');
        
        iconContainer.className = "w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-2";
        iconContainer.innerHTML = `<svg class="checkmark w-8 h-8 text-green-500" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" stroke="currentColor" stroke-width="2" fill="none" opacity="0"></circle><path d="M16 27.5 23.5 35 37 19.5" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
        
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').innerHTML = msg;
        actions.classList.remove('hidden'); 
        
        const btnConfira = document.getElementById('confira-post-btn');
        if(showLink) btnConfira.classList.remove('hidden');
        else btnConfira.classList.add('hidden');

        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        setTimeout(() => panel.classList.remove('scale-95', 'opacity-0'), 100);
    }

    function showNotificationError(title, msg) {
        const overlay = document.getElementById('notification-overlay');
        const panel = document.getElementById('notification-panel');
        const iconContainer = document.getElementById('notification-icon-container');
        const actions = document.getElementById('notification-actions');
        iconContainer.className = "w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2";
        iconContainer.innerHTML = '<svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>';
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').innerHTML = msg;
        actions.classList.remove('hidden');
        document.getElementById('confira-post-btn').classList.add('hidden'); 
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        setTimeout(() => panel.classList.remove('scale-95', 'opacity-0'), 100);
    }

    document.getElementById('novo-requerimento-btn').onclick = () => {
        const overlay = document.getElementById('notification-overlay');
        const panel = document.getElementById('notification-panel');
        overlay.classList.add('opacity-0');
        panel.classList.add('scale-95', 'opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        allForms.forEach(f => f.reset());
        document.querySelectorAll('.nickname-chips-container').forEach(c => c.innerHTML = '');
        document.querySelectorAll('[id$="-dynamic-fields"]').forEach(c => c.innerHTML = '');
        document.getElementById('licenca-duration-badge').textContent = "30 dias";
        document.getElementById('licenca-duration-helper').textContent = `Retorno previsto em: DD/MM/YYYY`;
        
        // RESETAR DA
        const daCheck = document.getElementById('check-membro-da');
        if(daCheck && daCheck.checked) daCheck.click(); 

        // RESETAR SUBGRUPOS (Licença)
        const subCheck = document.getElementById('check-subgrupo-licenca');
        if(subCheck && subCheck.checked) subCheck.click();
    };
  
  async function checkAndApplyUrlParams() {
      await new Promise(r => setTimeout(r, 500));
      const params = new URLSearchParams(window.location.search);
      const targetForm = params.get('form'); 
      if (!targetForm) return;

      const menuOption = document.querySelector(`.custom-dropdown-option[data-value="${targetForm}"]`);
      if (menuOption) menuOption.click(); else return;

      await new Promise(r => setTimeout(r, 500));
      const activeForm = document.getElementById(`form-${targetForm}`);
      if (!activeForm) return;

      const nicksParam = params.get('nicks') || params.get('nickname');
      if (nicksParam) {
          const inputMap = { 'entrada': 'entrada-nick-input', 'saida': 'saida-nickname-input', 'expulsao': 'expulsao-nickname-input', 'promocao': 'promocao-nick-input', 'advertencia': 'advertencia-nick-input' };
          const multiNickInputId = inputMap[targetForm];
          const multiNickInput = multiNickInputId ? document.getElementById(multiNickInputId) : null;
          if (multiNickInput && !multiNickInput.disabled) {
              multiNickInput.value = nicksParam; 
              const addBtn = multiNickInput.nextElementSibling;
              if (addBtn) addBtn.click(); 
          } else {
              const singleInput = activeForm.querySelector('input[name="nickname"], input[name="nickname_atual"]');
              if (singleInput) { singleInput.value = nicksParam; singleInput.blur(); }
          }
      }

      const fillFields = () => {
          params.forEach((value, key) => {
              if (['form', 'nicks', 'nickname', 'nicknames'].includes(key)) return; 
              const field = activeForm.querySelector(`[name="${key}"]`);
              if (field) {
                  const decodedValue = decodeURIComponent(value);
                  if (field.value !== decodedValue) {
                      field.value = decodedValue;
                      if(field.tagName === 'SELECT') field.dispatchEvent(new Event('change'));
                      if(field.tagName === 'INPUT') field.dispatchEvent(new Event('input'));
                  }
              } else if (key === 'dias' && targetForm === 'licenca') {
                 const slider = document.getElementById('licenca-dias');
                 if(slider && slider.value !== value) { slider.value = value; slider.dispatchEvent(new Event('input')); }
              }
          });
      };
      fillFields(); 
      if (nicksParam) {
          let attempts = 0;
          const interval = setInterval(() => { attempts++; fillFields(); if (attempts > 10) clearInterval(interval); }, 800);
      }
  }

  window.addEventListener('load', checkAndApplyUrlParams);

    async function handlePunishmentTabs(formId, formElement) {
        if (formId !== 'form-expulsao' && formId !== 'form-promocao') return;
        const chips = Array.from(formElement.querySelector('.nickname-chips-container').children);
        const groups = {};
        chips.forEach(chip => {
            const gId = chip.dataset.group;
            if(!groups[gId]) groups[gId] = [];
            groups[gId].push(chip.dataset.nick);
        });

        const dateObj = new Date();
        const day = String(dateObj.getDate()).padStart(2, '0');
        const months = ["Jan.", "Fev.", "Mar.", "Abr.", "Mai.", "Jun.", "Jul.", "Ago.", "Set.", "Out.", "Nov.", "Dez."];
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        const formattedDate = `${day} ${month} ${year}`;
        const forbiddenPhrases = ["Pulo de Script", "Manipulação de Script", "Manipulação de Conteúdo", "Manipulação de Aula", "Pulo de Aula", "Pulo de Conteúdo"];
        const hierarchy = { "Professor(a)": 1, "Mentor(a)": 2, "Capacitador(a)": 3, "Graduador(a)": 4, "Estagiário(a)": 5, "Ministro": 6, "Vice-Líder": 7, "Líder": 8 };

        const groupIds = Object.keys(groups).sort();
        for (const gId of groupIds) {
            const nicks = groups[gId].join(' / ');
            let shouldOpen = false;
            let medals = 0;
            let reasonText = "";
            let cargoFinal = "";
            let motivo = formElement.querySelector(`[name="motivo_g${gId}"]`)?.value || "";

            if (formId === 'form-promocao') {
                const cargoAtual = formElement.querySelector(`[name="cargo_atual_g${gId}"]`)?.value;
                const novoCargo = formElement.querySelector(`[name="novo_cargo_g${gId}"]`)?.value;
                const oldRank = hierarchy[cargoAtual] || 0;
                const newRank = hierarchy[novoCargo] || 0;
                if (newRank < oldRank) {
                    shouldOpen = true;
                    medals = -50;
                    reasonText = "Infração cometida no grupo de tarefas";
                    cargoFinal = novoCargo;
                }
            } else if (formId === 'form-expulsao') {
                cargoFinal = formElement.querySelector(`[name="cargo_g${gId}"]`)?.value;
                const hasForbidden = forbiddenPhrases.some(phrase => motivo.toLowerCase().includes(phrase.toLowerCase()));
                if (!hasForbidden) {
                    shouldOpen = true;
                    medals = -100;
                    reasonText = "Expulsão do grupo de tarefas";
                }
            }

            if (shouldOpen) {
                const baseUrl = "https://www.policiarcc.com/h17-postagem-de-medalhas-af";
                const params = new URLSearchParams({ responsavel_med: "", grupo_tarefas: "Escola de Formação de Executivos", periodo_med: formattedDate, gratificados_med: nicks, numero_med: medals, cargo_med: cargoFinal, motivo_grat: reasonText });
                window.open(`${baseUrl}?${params.toString()}`, '_blank');
                await delay(10000);
            }
        }
    }
