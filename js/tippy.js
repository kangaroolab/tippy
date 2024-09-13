    const {div, button, ul, li, span, textarea, input, a} = van.tags;
    let pellEditor = null;
    // State for the outline tree structure and notes
    const tree = van.state([]);
    const selectedNode = van.state(null);
    const editingNodeIndex = van.state(null);  // Track the node being edited
    const menuVisible = van.state(false);  // State to control menu visibility
    const drawerOpen = van.state(true);  // State to control drawer visibility
    // Function to toggle drawer visibility
    const toggleDrawer = () => drawerOpen.val = !drawerOpen.val;
    // Make selectedTabIndex as global state
    const selectedTabIndex = van.state(0);
    // Pell setting
    const pellSetting = {
      actions: [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'heading1',
          'heading2',
          'paragraph',
          'quote',
          'olist',
          'ulist',
          'code',
          'line',
          'link',
          'image',
          {
            name: 'backColor',
            icon: '<span style="background-color:#DAF7A6;">H</span>',
            title: 'Highlight Color',
            result: () => pell.exec('backColor', '#DAF7A6')
          },
          {
            name: 'removeFmt',
            icon: '<i><del>T</del></i>',
            title: 'Remove Format',
            result: () => pell.exec('removeFormat')
          },
          {
            name: 'details',
            title: 'create details',
            icon: '<span>&#x290B</span>',
            result: () => {
              const detailSec = "<details><summary>update summary and detail here/below</summary></details><p>else continue...</p>"
              pell.exec("insertHTML", detailSec)
            }
          },
          {
            name: 'indent',
            icon: '<b>>></b>',
            title: 'indent',
            result: () => pell.exec('indent')
          },
          {
            name: 'outdent',
            icon: '<b><<</b>',
            title: 'indent',
            result: () => pell.exec('outdent')
          },
          {
            name: 'codeblock',
            icon: '<b>C</b>',
            title: 'codeblock',
            result: () => addNotebook()
          }
    ]}
    
    // Function to create a unique ID
    const createUniqueId = () => Math.random().toString(36).substring(7);
        
    // Function to add a new child node
    const addNode = (parentNode) => {
        const newNode = { name: `Node ${createUniqueId()}`, children: [], notes: [], expanded: true };
        parentNode.children.push(newNode);
        tree.val = [...tree.val];  // Trigger re-render by reassigning the state
    };

    // Function to remove a node safely
    const removeNode = (nodeToRemove, parentNode = null) => {
        if (!parentNode) {
            // Remove the node from the root level
            tree.val = tree.val.filter(node => node !== nodeToRemove);
        } else {
            // Remove the node from its parent's children
            parentNode.children = parentNode.children.filter(node => node !== nodeToRemove);
        }
        tree.val = [...tree.val];  // Trigger re-render
        selectedNode.val = parentNode;
    };

    // Function to select a node
    const selectNode = (node) => {selectedNode.val = node; selectedTabIndex.val = 0;}

    // Function to toggle expand/collapse state
    const toggleExpand = (node) => {
        node.expanded = !node.expanded;
        tree.val = [...tree.val];  // Trigger re-render
    };

    // Function to toggle the menu visibility
    const toggleMenu = () => menuVisible.val = !menuVisible.val;

    // Function to handle menu actions
    const handleMenuAction = (action) => {
        switch(action) {
            case "Open":
                openFile();
                break;
            case "Save":
                saveFile();
                break;
        }
        menuVisible.val = false;  // Hide menu after an action
    };

    // Function to convert the tree state to a JSON string
    const getTreeData = () => JSON.stringify(tree.val, null, 2);

    // Updated saveFile function with filename prompt
    const downlaodFile = () => {
        // Prompt the user to enter a filename
        const filename = prompt("Enter filename for saving:", tree.val[0].name + ".json");
        
        // If a filename is provided, proceed with saving
        if (filename) {
            const blob = new Blob([getTreeData()], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename; // Use the filename provided by the user
            a.click();
            URL.revokeObjectURL(url); // Clean up the object URL
        }
    };

    const saveFile = async () => {
        try {
            // Show the file save dialog
            const handle = await window.showSaveFilePicker({
                suggestedName: tree.val[0].name + ".json",
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            });

            // Create a writable stream
            const writable = await handle.createWritable();

            // Write the file
            await writable.write(new Blob([getTreeData()], { type: "application/json" }));

            // Close the file and write the contents to disk
            await writable.close();
        } catch (err) {
            console.error('Error saving file:', err);
        }
    };


    // Function to handle file selection and read its content
    const openFile = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        tree.val = data;
                        selectedNode.val = null; // Clear selected node after opening file
                    } catch (error) {
                        alert("Failed to parse JSON file.");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    // Recursive function to render the tree nodes
    const renderTree = (nodes, parentNode = null, depth = 0) => ul(
        nodes.map((node, index) =>
            li(
                div({
                        class: "node",
                        style: `padding-left: ${depth * 20}px;`  // Indentation based on depth
                    },
                    node.children.length > 0 ? a({
                            href: "#", class: "icon", title: node.expanded ? "Collapse" : "Expand",
                            onclick: (e) => (e.preventDefault(), toggleExpand(node))
                        },
                        // Using innerHTML for expand/collapse icons
                        div({innerHTML: node.expanded ? `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>` : `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>`
                        })) : "",
                    span(" "), // Space between icon and node name
                    node.notes.length > 0 ? span("📄") : "",  // Document icon if the node has notes
                    editingNodeIndex.val === node ? input({
                        type: "text",
                        value: node.name,
                        oninput: (e) => {
                            node.name = e.target.value;  // Update the node name without re-render
                        },
                        onblur: () => {
                            editingNodeIndex.val = null;  // Exit edit mode on blur
                            tree.val = [...tree.val];  // Trigger re-render after editing
                        },
                        onkeypress: (e) => {  // Exit edit mode on Enter key
                            if (e.key === 'Enter') {
                                editingNodeIndex.val = null;
                                tree.val = [...tree.val];  // Trigger re-render after editing
                            }
                        }
                    }) : span(
                        {
                            ondblclick: () => editingNodeIndex.val = node,  // Double-click to enter edit mode for the correct node
                            onclick: () => selectNode(node),
                            style: () => selectedNode.val === node ? "font-weight: bold; cursor: pointer;" : "cursor: pointer;"
                        },
                        node.name
                    ),
                    selectedNode.val === node ? div({class: "actions"},
                        a({
                            href: "#", class: "icon", title: "Add Child",
                            onclick: (e) => (e.preventDefault(), addNode(node))
                        }, "➕"),
                        parentNode ? a({
                            href: "#", class: "icon", title: "Remove Node",
                            onclick: (e) => (e.preventDefault(), removeNode(node, parentNode))
                        }, "❌") : ""
                    ) : ""
                ),
                node.children.length > 0 && node.expanded ? renderTree(node.children, node, depth + 1) : null
            )
        )
    );

    // Function to add a new note tab for the selected node
    const addNoteTab = () => {
        if (!selectedNode.val) return;  // No node selected
        selectedNode.val.notes.push({ tabName: `Note ${selectedNode.val.notes.length + 1}`, content: "" });
        selectedNode.val = { ...selectedNode.val };  // Ensure selectedNode state is updated
        tree.val = [...tree.val];  // Trigger re-render of the tree
    };
    
    // Function to delete a tab and its associated note
    const delNoteTab = (index) => {
        // Remove the tab and note from the state
        selectedNode.val.notes.splice(index, 1);
        selectedNode.val = { ...selectedNode.val };  // Ensure selectedNode state is updated
    };

    // Function to render the right notes column
    const Notes = () => {
        //const selectedTabIndex = van.state(0);
        const editingTabIndex = van.state(-1);  // Keeps track of the editing tab

        return () => {
            if (!selectedNode.val) {
                return div("No Node Selected");
            }

            const notes = selectedNode.val.notes;

            return div(
                div({class: "note-header"},
                    span({style: "font-weight: bold; font-size: 18px;"}, selectedNode.val.name),
                    button({onclick: addNoteTab}, "Add Note Tab")
                ),
                div(
                    notes.length > 0 ?
                        notes.map((note, index) =>
                            span(
                                {
                                    class: () => selectedTabIndex.val === index ? "tab active-tab" : "tab",
                                    ondblclick: () => {
                                        editingTabIndex.val = index;  // Double-click to enter edit mode
                                    },
                                    onclick: () => {
                                        if (editingTabIndex.val !== index) {  // Only change selection if not editing
                                            selectedTabIndex.val = index;
                                        }
                                    }
                                },
                                editingTabIndex.val === index ? input({
                                    type: "text",
                                    value: note.tabName,
                                    oninput: (e) => {
                                        note.tabName = e.target.value;  // Update the tab name without re-render
                                    },
                                    onblur: () => {
                                        editingTabIndex.val = -1;  // Exit edit mode on blur
                                        selectedNode.val.notes[index] = {...note};  // Reassign the note to trigger reactivity
                                        selectedNode.val = { ...selectedNode.val };  // Re-render only after editing is complete
                                    },
                                    onkeypress: (e) => {  // Exit edit mode on Enter key
                                        if (e.key === 'Enter') {
                                            editingTabIndex.val = -1;
                                            selectedNode.val.notes[index] = {...note};  // Reassign the note to trigger reactivity
                                            selectedNode.val = { ...selectedNode.val };  // Re-render only after editing is complete
                                        }
                                    }
                                }) : note.tabName,
                                <!-- "x" button to delete the tab -->
                                span({
                                  class: "delete-icon",
                                  onclick: (e) =>
                                    {e.stopPropagation();
                                    selectedTabIndex.val = Math.max(0, index - 1);
                                    delNoteTab(index);}
                                },
                                'x'
                                  )
                            )
                        )
                        : ""
                ),
                div(
                    {
                        class: "tab-container"
                    },
                    () => notes[selectedTabIndex.val] ?
                        (() => { const noteEditor = div({
                            class: "note-content"
                            });
                                if (pellEditor) pellEditor = null;
                                // Initialize a new MediumEditor on the selected textarea
                                pellEditor = pell.init({
                                  element: noteEditor,
                                  onChange: html => {
                                    notes[selectedTabIndex.val].content = html;
                                  },
                                  styleWithCSS: true,
                                  actions: pellSetting.actions,
                                  classes: {
                                    actionbar: 'pell-actionbar',
                                    button: 'pell-button',
                                    content: 'pell-content'
                                  }
                                });
                                pellEditor.content.innerHTML = notes[selectedTabIndex.val].content;
                                
                                const actionBar = pellEditor.children[0];
                                const editorContent = pellEditor.children[1];
                                
                                editorContent.querySelectorAll('.code-editor').forEach(editor => {
                                    const codeContainer = editor.querySelector('.codeTextarea');
                                    const initialCode = codeContainer ? codeContainer.innerHTML : "";
                                    const newNotebook = Notebook(initialCode);
                                    editor.replaceWith(newNotebook);
                                });

                                editorContent.addEventListener('pointerup', () => {
                                  const selection = window.getSelection();
                                  if (!selection.isCollapsed) {
                                    const range = selection.getRangeAt(0);
                                    const rect = range.getBoundingClientRect();
                                    actionBar.style.top = `${rect.top + window.scrollY - actionBar.offsetHeight + 25}px`;
                                    actionBar.style.left = `${rect.left + window.scrollX + 50}px`;
                                    actionBar.style.display = 'block';
                                  } else {
                                    actionBar.style.display = 'none';
                                  }
                                });
                            
                                // Hide action bar on outside click
                                document.addEventListener('click', (event) => {
                                  if (!editorContent.contains(event.target)) {
                                    actionBar.style.display = 'none';
                                  }
                                });
                                
                                return noteEditor;}) () : ""
                )
            );
        };
    };

    // Function to handle menu blur
    const handleMenuBlur = (e) => {
        setTimeout(() => {
            if (!document.querySelector(".menu:hover") && !e.target.closest(".menu")) {
                menuVisible.val = false;  // Hide menu if not hovering over it and click outside
            }
        }, 100);
    };

    const App = () => div(
        {class: () => drawerOpen.val ? "container drawer-open" : "container drawer-closed"},
        div(
            {class: "outline"},
            div({class: "menu-container"},  // Menu container at the top
                div({class: "menu", style: () => menuVisible.val ? "display: block;" : "display: none;"},
                    a({onpointerdown: () => handleMenuAction("Open")}, "Open"),
                    a({onpointerdown: () => handleMenuAction("Save")}, "Save")
                ),
                a({
                    href: "#", onpointerdown: (e) => (e.preventDefault(), toggleMenu())
                },
                div({
                  class: "menu-button",
                  innerHTML: `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>`
                })),
                button({
                    class: "drawer-button",
                    onclick: (e) => (e.preventDefault(), toggleDrawer()),
                    innerHTML: () => drawerOpen.val ? `
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 7l-5 5 5 5V7z" fill="currentColor"/>
  <path d="M20 19V5h-2v14h2z" fill="currentColor"/>
</svg>` : `
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 7l5 5-5 5V7z" fill="currentColor"/>
  <path d="M4 19V5h2v14H4z" fill="currentColor"/>
</svg>`,
                    style: "width: 24px; height: 24px;"  // Set the size of the drawer button
                })
            ),
            div({class: "node-container"},  // Node container underneath menu container
                () => renderTree(tree.val)
            )
        ),
        div({class: "notes"}, Notes())
    );

    // Attach blur event handler to the document
    document.addEventListener('mousedown', handleMenuBlur);

    // Initialize the tree with a root node
    tree.val = [{ name: 'Root Node', children: [], notes: [], expanded: true }];

    van.add(document.body, App());
    