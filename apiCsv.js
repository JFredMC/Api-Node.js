const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const port = 3000;

const readFile = () => {
    return new Promise((resolve, reject) => {
        const fileData = [];
        fs.createReadStream('csv/biostats.csv')
        .pipe(csv())
        .on('data', (data) => fileData.push(data))
        .on('end', () => resolve(fileData))
        .on('error', (err) => reject(err))
    });    
}

const writeFile = async (data) => await fs.appendFileSync('csv/biostats.csv', data);

//Habilito el uso de este modulo para usarl el body-parser en la petición POST y quedara disponible en el request.body
app.use(express.json());

//Realizo la petición GET con el path /usuarios 
app.get('/usuarios', async (request, response) => {
    const data = await readFile();
    response.status(200).json(data);
});

app.get('/usuarios/cantidad', async (req, response) => {
    const data = await readFile();
    response.status(200).json(data.length);
});

//Traigo un usuario en especifico convertiendo el index de mi array de usuarios en el id para identificar que usuario debe mostrar la api
app.get('/usuarios/:id', async (request, response) => {
    let id = request.params.id;
    const data = await readFile();
    if(id > -1 && id < data.length){
        return response.status(200).send(data[id]);
    }else{
        return response.status(400).send('No existe el Id')
    }
});

//Agrego un nuevo usuario atraves del metodo POST. en la peticion ingreso un nuevo usuario en formato JSON
//Aqui dejo un ejemplo de un usuario nuevo que podemos agregar.
// {
//     "Name": "Jhon",
//     "Age": 28,
//     "Sex": "M",
//     "Weight": 111,
//     "Height": 111
// }
app.post('/usuarios', async (request, response) => {
    const user = request.body;
    if(user.Name && user.Sex && user.Age && user.Height && user.Weight){
        const data = `\n"${user.Name}","${user.Sex}",${user.Age},${user.Height},${user.Weight}`
        const userData = await readFile();
        const userName = []
        const userArray = userData.forEach(value => {
            if(user.Name === value.Name){
            userName.push(value.Name)
            }
        });

        //Válido que no se repitan usuarios con el mismo nombre
        if(user.Name != userName){
            await writeFile(data);
            const newData = await readFile();
            response.status(200).json(newData);
            
        }else{   
            response.status(400).send('Usuario repetido')
        }
        
    }else{
        response.status(400).send('Faltan atributos')
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});