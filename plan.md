views {
    login/create account link AKA index,
    create account

    view all folders page {
        make and rename links.
    }
    view individual folder page {
        
    }
    upload file page,
    individual file pages.

    404
    file not found 404?
}

routes {
    login {
        create account,
        login,
        logout
    }
    folders {
        view all folders,
        create folder,
        rename folder,
        delete folder
        view auth folder,
        view unauth folder?
        
        file {
            view file,
            create file,
            delete file
        }
    }
}

models {
    user {
        id
        username/email text,
        password text,
        folders FOLDERS[]
    }
    folders {
        id
        user
        files []
    }
    files {
        id
        fileLink text,
        name text,
        size int,
        uploadTime timestamp
        folder
    }
    session {

    }
}