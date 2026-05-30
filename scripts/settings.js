
import { supabase } from './render.js'; // или путь к файлу, где лежит конфиг Supabase

// =========================================================================
// 🦫 ОМНИ-МОДУЛЬ НАСТРОЕК ПРОФИЛЯ С ПОЛНЫМ РЕНДЕРОМ ВНУТРИ SWEETALERT2
// =========================================================================

window.openSwalSettings = async function () {
    // 1. Проверяем, жива ли сессия Supabase перед открытием
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return Swal.fire("Ошибка доступа", "Вы не авторизованы!", "error");
   const user = session.user;
    // Ищем имя в метаданных, а если его нет - лениво берем имя почты до собаки
    const currentName = user.user_metadata?.display_name || user.user_metadata?.name || user.email.split('@')[0] || 'Аноним';
    // 2. Вызываем ультимативное омни-окно Swal.fire
    Swal.fire({
        title: '⚙️ Настройки профиля',
        // Вставляем кастомный плоский HTML-шаблон инпутов и кнопок прямо внутрь алерта!
        html: `
            <div style="text-align: left; font-family: sans-serif; margin-top: 10px;">
                <!-- Контур А: Смена Имени -->
                <div style="margin-bottom: 18px; padding-bottom: 15px; border-bottom: 1px dashed #eee;">
                    <label style="display: block; font-size: 13px; font-weight: bold; color: #555; margin-bottom: 6px;">Новое имя пользователя:</label>
                    <input type="text" id="swal-update-name" value="${currentName}" placeholder="Введите никнейм" style="width: 100%; padding: 10px; border: 1px solid #ececec; border-radius: 6px; font-size: 14px; box-sizing: border-box; margin-bottom: 8px; outline: none;">
                    <button id="swal-btn-name-update" style="width: 100%; background: #41cfff; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s;">Обновить имя аккаунта</button>
                </div>

               <div>
                    <label style="display: block; font-size: 13px; font-weight: bold; color: #555; margin-bottom: 6px;">Новый пароль безопасности:</label>
                    <input type="password" id="swal-update-password" placeholder="Минимум 6 символов" style="width: 100%; padding: 10px; border: 1px solid #ececec; border-radius: 6px; font-size: 14px; box-sizing: border-box; margin-bottom: 10px; outline: none;">
                    
                    <label style="display: block; font-size: 13px; font-weight: bold; color: #555; margin-bottom: 6px;">Повторите новый пароль:</label>
                    <input type="password" id="swal-update-password-confirm" placeholder="Повторите пароль один в один" style="width: 100%; padding: 10px; border: 1px solid #ececec; border-radius: 6px; font-size: 14px; box-sizing: border-box; margin-bottom: 12px; outline: none;">
                    
                    <button id="swal-btn-password-update" style="width: 100%; background: #ff4d4d; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s;" onmouseover="this.style.background='#cc0000'" onmouseout="this.style.background='#ff4d4d'">Установить новый пароль</button>
                </div>
            </div>
        `,
        showConfirmButton: false, // Отключаем дефолтную кнопку "ОК", у нас свои кастомные кнопки!
        showCloseButton: true, // Красивый крестик закрытия в правом верхнем углу
        focusConfirm: false,
        background: '#ffffff',
        borderRadius: '12px'
    });
};

 // 🔥 СИНЬОРСКАЯ МАГИЯ INTERCEPT: Навешиваем слушатели кликов строго ПОСЛЕ отрисовки модалки в DOM!
        didOpen: () => {
            const btnName = document.getElementById('swal-btn-name-update');
            const btnPassword = document.getElementById('swal-btn-password-update');

            if (btnName) {
                btnName.addEventListener('click', async () => {
                    const input = document.getElementById('swal-update-name');
                    if (!input) return;
                    
                    const newName = input.value.trim();
                    if (!newName) return Swal.showValidationMessage("Имя не может быть пустым! 📝");

                    try {
                        // Жестко ждем ответа от Supabase
                        const { error } = await supabase.auth.updateUser({
                            data: { display_name: newName, name: newName }
                        });
                        if (error) throw error;

                        const userHeaderName = document.getElementById('profile-user-name');
                        if (userHeaderName) userHeaderName.innerText = newName;

                        Swal.fire({ title: "Имя обновлено! 🎉", text: `Никнейм успешно изменен на "${newName}"!`, icon: "success", confirmButtonColor: "#41cfff" });
                    } catch (err) {
                        Swal.showValidationMessage(`Ошибка Supabase: ${err.message}`);
                    }
                });
            }

            if (btnPassword) {
                btnPassword.addEventListener('click', async () => {
                    const passInput = document.getElementById('swal-update-password');
                    const confirmInput = document.getElementById('swal-update-password-confirm');
                    if (!passInput || !confirmInput) return;

                    const newPassword = passInput.value.trim();
                    const confirmPassword = confirmInput.value.trim();

                    if (!newPassword || newPassword.length < 6) {
                        return Swal.showValidationMessage("Пароль обязан содержать минимум 6 символов! 🔒");
                    }
                    if (newPassword !== confirmPassword) {
                        confirmInput.value = '';
                        confirmInput.focus();
                        return Swal.showValidationMessage("Пароли не совпадают! ❌ Проверьте ввод.");
                    }

                    try {
                        const { error } = await supabase.auth.updateUser({ password: newPassword });
                        if (error) throw error;

                        Swal.fire({ title: "Пароль изменен! 🔒⚔️", text: "Новый зашифрованный ключ успешно прописан в ядро Supabase Auth!", icon: "success", confirmButtonColor: "#ff4d4d" });
                    } catch (err) {
                        Swal.showValidationMessage(`Ошибка пароля: ${err.message}`);
                    }
                });
            }
        }
