;; this is bootstrap to run during webapp loading
(println "load menu and templates...")

(defn init-van-tags [args]
  (doseq [t args]
    (intern *ns* (symbol t) (aget js/van.tags t))))

(init-van-tags ["button" "div" "input" "select" "textarea" "style" "ul" "li" "a" "img" "span"])

(defn vantag
  ([tag]
   (tag))
  ([tag attr]
   (tag (clj->js attr)))
  ([tag attr & children]
   (tag (clj->js attr) (clj->js children))))

;;load menu
(let [nm (js/document.querySelector "#noteMenu")]
  (js/van.add nm (a #js {:href "#"
                       :onclick (fn [] 
                                  (.setItem js/sessionStorage "note-cache" 
                                    (.-content (get (some-> js/selectedNode .-val .-notes) (.-val js/selectedTabIndex)))
                                ))
                      } 
                      "Copy Note"))
  (js/van.add nm (a #js {:href "#"
                       :onclick (fn [] 
                                  (js/document.execCommand "insertHTML" false (.getItem js/sessionStorage "note-cache")) 
                                )
                      } 
                      "Paste Note"))
)
(let [nm (js/document.querySelector ".menu")]
  (js/van.add nm (a #js {:href "#"
                       :onclick (fn [] 
                                  (.setItem js/localStorage
                                            "node-cache"
                                            (js/JSON.stringify (.-val js/selectedNode))
                                  )
                                )
                      } 
                      "Export Node"))
  (js/van.add nm (a #js {:href "#"
                       :onclick (fn [] 
                                  (.push (some-> js/selectedNode .-val .-children)
                                         (js/JSON.parse
                                            (.getItem js/localStorage "node-cache")
                                         ))
                                  (set! (.-val js/selectedNode) nil)
                                )
                      } 
                      "Import Node"))
)
