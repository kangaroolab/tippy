;; this is bootstrap to run during webapp loading
(println "bootstrap runs...")

(defn saveConfig []
  (.setItem js/localStorage
    "tippy-init"
    (js/JSON.stringify (.-val js/tree))
))

(defn initGlobal []
  (let [script (js/document.createElement "script")
        cljs-files 
          ["cljs/init.cljs"]]
    (doseq [file cljs-files]
        (set! (.-type script) "application/x-scittle")
        (set! (.-src script) file)
        (-> js/scittle .-core (.eval_script_tags script))))
)

(let [elDiv (.createElement js/document "div")
      tippy-init (js/JSON.parse (js/localStorage.getItem "tippy-init"))
      autorun (js->clj 
                (some-> tippy-init
                    (aget 0)
                    .-children
                    (.find (fn [node] (= (.-name node) "Setting")))
                    .-children
                    (.find (fn [node] (= (.-name node) "autorun")))
                 )
            )
      config (some (fn [note] (when (= (get note "tabName") "config") note)) (get autorun "notes"))
      scripts (some (fn [node] (when (= (get node "name") "scripts") node)) (get autorun "children"))
      _ (set! (.-innerHTML elDiv) (get config "content")) 
      config (clojure.edn/read-string (some-> elDiv (.querySelector "#hiddenCode") (.getAttribute "code")))
      global (:loading (:global config))
      global (if-some [g global] g true)
      torun (:loading (:user config))
     ]
     (if global (initGlobal))
     (doseq [r torun]
        (set! (.-innerHTML elDiv)
          (get (some (fn [note] (when (= (get note "tabName") r) note)) (get scripts "notes"))
           "content")
        )
        (load-string (.getAttribute (.querySelector elDiv "#hiddenCode") "code"))
    )
)
