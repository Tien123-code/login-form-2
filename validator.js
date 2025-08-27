
function validator (formSelector,submit) {

    getParent = function (element,selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var formRules = {};

    // Quy ước tạo rule:
    var validatorRules = {
    required: function (value) {
        return value ? undefined : 'Vui lòng nhập trường này';
    },
    email: function (value) {
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(value) ? undefined : 'Vui lòng nhập email';
    },
    min: function (min) {
        return function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
        }
    },
    max: function (max) {
        return function (value) {
            return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`;
        }
    }
};


    // Lấy element của form cần validate
    var formElement = document.querySelector(formSelector);

    // Chỉ xử lý khi có element của form
    if(formElement) {   

        // Lấy ra các input có attribute rules
        var inputs = formElement.querySelectorAll('[name][rules]');
        
        // Lặp qua từng input và lấy ra rules
        for(var input of inputs) {
            
            var isHasValue = false;
            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules) {

                if(rule.includes(':')) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    isHasValue = true;
                }
                var ruleFunc = validatorRules[rule];

                if(isHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];

                }

            }

           
            // Lắng nghe sự kiện để validate (blur, change, ...)
            input.onblur = handleValidate;
            input.oninput = handleClear;
        }

           function handleValidate (event) {
                  // Lấy các rule dựa trên tên của input
                const rules = formRules[event.target.name];
                let errorMessage = "";

                // Tìm rule đầu tiên trả về thông báo lỗi
                // rules.find((rule) => {
                //     errorMessage = rule(event.target.value);

                //     return errorMessage; // Dừng khi gặp lỗi đầu tiên
                // });
                for(var i = 0; i< rules.length; i++) {
                    errorMessage = rules[i](event.target.value);
                    if(errorMessage) break;
                }

               if(errorMessage) {
                    let parentElement = getParent(event.target, '.form-group');
                    parentElement.classList.add('invalid');
                    errorElement = parentElement.querySelector('.form-message');
                    errorElement.innerText = errorMessage;

               }

               return !errorMessage;
           }      
           
           function handleClear(event) {
                 let parentElement = getParent(event.target, '.form-group');
                    parentElement.classList.remove('invalid');
                    errorElement = parentElement.querySelector('.form-message');
                    errorElement.innerText = "";
           }

           formElement.onsubmit = function (event) {
                event.preventDefault();

                let isValid = true;
                var inputs = formElement.querySelectorAll('[name][rules]');
        
         // Lặp qua từng input và lấy ra rules
                 for(var input of inputs) {
                    if(!handleValidate({target: input})) {
                        isValid = false;
                    } 
                 }

                 if(isValid) {
                  if(typeof submit === 'function') {
                    // Lấy ra các input có name và không bị disable
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    // Chuyển đổi NodeList thành mảng và lấy giá trị của các input
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                    
                    switch (input.type) {
                        case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                        case 'checkbox':
                            if(!input.matches(':checked')) return values;
                              if(!Array.isArray(values[input.name])) 
                                    values[input.name] = [];
                               values[input.name].push(input.value); 
                               break;
                        default:
                              values[input.name] = input.value;

                            }
                            
                         return values;

                    },{})
                    // Gọi hàm onsubmit và truyền giá trị của form
                   submit(formValues);
                 }
                 else { 
                    // Không submit
                 }
        
                }
    }
    }
}