// PouchDB utilities

const db = PouchDB("messages");

const saveMessage = (message) => {
    message._id = new Date().toISOString();
    return db.put(message).then(() => {
        self.registration.sync.register("new-post");

        const newResp = {ok: true, offline: true};

        //Creo una respuesta con el contenido de newResp para el frontend
        return new Response(JSON.stringify(newResp));
    });
};

const postMessages = () => {
    const posts = [];

    return db.allDocs({include_docs: true}).then((docs) => {
        docs.rows.forEach((row) => {
            const doc = row.doc;

            const fetchProm = fetch("api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(doc)
            }).then((resp) => {
                return db.remove(doc);
            });

            posts.push(fetchProm);
        }); //Fin forEach

        return Promise.all(posts);
    });
};
