
        const { pre, br} = van.tags;

        // Notebook component
        const Notebook = (initialCode) => {
            //const initialCode = attr("code", "");
            //const code = van.state("");
            const code = van.state(initialCode || "");
            const output = van.state("");

            // Apply some styles.
            const style = document.createElement('style');
            style.textContent = `
              .code-editor {
                  display: flex;
                  flex-direction: column;
                  gap: 10px;
                  border: 1px solid #ccc;
                  padding: 10px;
              }
              .code-container {
                  display: flex;
                  border-bottom-left-radius: 6px;
                  border-bottom-right-radius: 6px;
                  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
              }
              .codeTextarea {
                  width: 100%;
                  min-height: 100px;
                  border: none;
                  outline: none;
                  resize: none;
                  line-height: 1.2; /* Adjusted line height to match line numbers */
                  font-family: monospace; /* Ensure consistent font */
                  font-size: 14px; /* Adjusted font size */
                  padding: 5px; /* Ensure padding matches line numbers */
                  display: block;
                  white-space: pre; /* Preserve whitespace and line breaks */
                  overflow-x: scroll;
              }
              .codeTextarea:empty:before {
                content: attr(placeholder);
                color: gray;
                pointer-events: none;
              }
              .line-numbers {
                  border-right: 1px solid #ccc;
                  user-select: none;
                  text-align: right;
                  margin-right: 10px;
                  white-space: pre-wrap;
                  background-color: #f0f0f0;
                  line-height: 1.2; /* Adjusted line height */
                  font-size: 14px; /* Adjusted font size */
                  padding: 5px; /* Optional: Add some padding for better spacing */
                  font-family: monospace; /* Ensure consistent font */
                  width: auto; /* Revert to previous width */
              }
              .line-numbers span {
                  display: block;
                  line-height: 1.2; /* Ensure line height matches textarea */
              .output-container {
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              .run-icon {
                  cursor: pointer;
                  font-size: 16px;
                  width: auto; /* Match the width of line numbers */
                  text-align: center; /* Center the icon */
              }
              .code-output {
                  flex-grow: 1; /* Make the output take the remaining width */
                  background-color: #f0f0f0; /* Set the background color */
                  border: 1px solid #ccc;
                  padding: 0 10px;
                  display: inline-block;
                  min-height: 16px;
                  font-family: monospace; /* Ensure consistent font */
                  font-size: 14px; /* Adjusted font size */
              }
              `;

            // Function to run the code and update the output
            const runCode = () => {
                try {
                    let stmt = document.getSelection().toString() || code.val;
                    //stmt = stmt.replace(/(\r\n|\n|\r)/gm, "");
                    const result = scittle.core.eval_string(stmt);
                    output.val = result;
                } catch (e) {
                    output.val = e.toString();
                }
            };
            
            // Function to update line numbers
            const updateLineNumbers = (textarea, lineNumbers) => {
              //const numberOfLines = textarea.value.split('\n').length;
              const numberOfLines = textarea.innerText.split('\n').length;
              //const numberOfLines = Math.max(textarea.getElementsByTagName("div").length, 1);
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
                onpointerup: e => {
                    e.stopPropagation(); // Prevents the event from bubbling up to the container
                },
                placeholder: "Write your code here...",
                innerHTML: initialCode || ""
            });
            
            code.val = codeTextarea.innerText; //required when switching tab or load from file
            updateLineNumbers(codeTextarea, lineNumbers);

            const codeEditor = div(
                { class: "code-editor" },
                div({ class: "code-container" }, lineNumbers, codeTextarea),
                div(
                    { class: "output-container" },
                    span({ class: "run-icon", onclick: runCode }, "▶️"),
                    div({ class: "code-output", textContent: output })
                )
            );
            
            const minEditor = (el, highlight, tab = '    ') => {
  	        const caret = () => {
  	          const range = window.getSelection().getRangeAt(0);
  	          const prefix = range.cloneRange();
  	          prefix.selectNodeContents(el);
  	          prefix.setEnd(range.endContainer, range.endOffset);
  	          return prefix.toString().length;
  	        };
  	
  	        const setCaret = (pos, parent = el) => {
  	          for (const node of parent.childNodes) {
  	            if (node.nodeType == Node.TEXT_NODE) {
  	              if (node.length >= pos) {
  	                const range = document.createRange();
  	                const sel = window.getSelection();
  	                range.setStart(node, pos);
  	                range.collapse(true);
  	                sel.removeAllRanges();
  	                sel.addRange(range);
  	                return -1;
  	              } else {
  	                pos = pos - node.length;
  	              }
  	            } else {
  	              pos = setCaret(pos, node);
  	              if (pos < 0) {
  	                return pos;
  	              }
  	            }
  	          }
  	          return pos;
  	        };
  	
            highlight(el);
  
  	        el.addEventListener('keydown', e => {
  	          if (e.which === 9) {
  	            const pos = caret() + tab.length;
  	            const range = window.getSelection().getRangeAt(0);
  	            range.deleteContents();
  	            range.insertNode(document.createTextNode(tab));
  	            highlight(el);
  	            setCaret(pos);
  	            e.preventDefault();
  	          }
  	        });
  	
  	        el.addEventListener('keyup', e => {
  	          if (e.keyCode >= 0x30 || e.keyCode == 0x20) {
  	            const pos = caret();
  	            highlight(el);
  	            setCaret(pos);
  	          }
  	        });
  	      };
          
          // Syntax highlight for JS
  	      const js = el => {
  	        for (const node of el.children) {
  	          const s = node.innerText
  	            .replace(
            /\b(def|defn|loop|conj|recur|map|str|doc|type|meta|require|println|reduce|apply|let|if|:keys|cond|else|and|not|or|partition|pmap|inc|dec|for|when|\.\w+)(?=[^\w])/g,
            '<font color="Blue Violet">$1</font>',
          );
  	          node.innerHTML = s.split('\n').join('<br/>');
  	        }
  	      };
            
          minEditor(codeTextarea, js)
          // Create a document fragment
          const fragment = document.createDocumentFragment();
          fragment.appendChild(style);
          fragment.appendChild(codeEditor);
          return  fragment;
      };

        // Function to add a new notebook component to the existing editable div
        const addNotebook = () => {
            const notebookContainer = div({ contenteditable: false }, Notebook());
            van.add(document.querySelector(".pell-content"), notebookContainer, br());
        };
        
