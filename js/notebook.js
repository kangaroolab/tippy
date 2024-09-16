        const { pre, br} = van.tags;

        // Notebook component
        const Notebook = (initialCode) => {
            const code = van.state(initialCode || "");
            const output = van.state("");

            // Function to run the code and update the output
            const runCode = () => {
                try {
                    let stmt = code.val;
                    stmt = stmt.replace(/(\r\n|\n|\r)/gm, "");
                    const result = scittle.core.eval_string(stmt);
                    output.val = result;
                } catch (e) {
                    output.val = e.toString();
                }
            };
            
            const pasteCode = (e) => {
               e.preventDefault();
              const clipboardData = (e.clipboardData || window.clipboardData).getData('text');
              const lines = clipboardData.split('\n');
              const fragment = document.createDocumentFragment();
              lines.forEach(line => {
                  const newDiv = document.createElement('div');
                  newDiv.textContent = line;
                  fragment.appendChild(newDiv);
              });
              document.getSelection().deleteFromDocument();
              codeTextarea.appendChild(fragment);
              code.val = codeTextarea.innerText;
              updateLineNumbers(codeTextarea, lineNumbers);
            }

            // Function to update line numbers
            const updateLineNumbers = (textarea, lineNumbers) => {
                //const numberOfLines = textarea.value.split('\n').length;
                //const numberOfLines = textarea.innerText.split('\n').length;
                const numberOfLines = Math.max(textarea.getElementsByTagName("div").length, 1);
                lineNumbers.innerHTML = Array.from({ length: numberOfLines }, (_, i) => `<span>${i + 1}</span>`).join('');
            };

            const lineNumbers = div({ class: "line-numbers" });
            
            const codeTextarea = div({
                class: "codeTextarea",
                contenteditable: true,
                oninput: e => {
                    code.val = e.target.innerText;
                    updateLineNumbers(e.target, lineNumbers);
                },
                onpaste: e => {
                  pasteCode(e);
                },
                placeholder: "Write your clojure code here...",
                innerHTML: initialCode || ""
            });
            
            code.val = codeTextarea.innerText; //required when switching tab or load from file
            updateLineNumbers(codeTextarea, lineNumbers);

            return div(
                { class: "code-editor" },
                div({ class: "code-container" }, lineNumbers, codeTextarea),
                div(
                    { class: "output-container" },
                    span({ class: "run-icon", onclick: runCode }, "▶️"),
                    div({ class: "code-output", textContent: output })
                )
            );
        };

        // Function to add a new notebook component to the existing editable div
        const addNotebook = () => {
            const notebookContainer = div({ contenteditable: false }, Notebook());
            van.add(document.querySelector(".pell-content"), notebookContainer, br());
        };
        
        