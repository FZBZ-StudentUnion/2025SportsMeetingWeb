const fs = require( "fs" );
const { exec } = require( 'child_process' );


var json_data, listed_data;

fs.readFile( "./20.json", ( err, data ) => {
    if ( err ) throw err;

    

    json_data = data;

    listed_data = JSON.parse( data );


    //console.log( listed_data );

    //for ( var i = 0; i < listed_data; i++ ) {
    //    console.log( listed_data[0][0].grade );
    //}

    for ( var i = 0; i < listed_data.length; i++ ) {
        for ( var j = 0; j < listed_data[i].length; j++ ) {
            var obj = listed_data[i][j]


            var oldFile = obj.name.replace( / /g, "-" ) + ".json";
            var newFile = obj.link.slice(11, obj.link.length) + ".json";
            console.log( obj.grade + oldFile + "---->" + newFile );

            exec( "mv " + obj.grade + oldFile + " " + newFile, ( err, stdout, stderr ) => {
                if ( err ) {
                    console.log( err );

 

                    return ;
                }

                console.log(`stdout: ${stdout}`);
            } )

        } 
    }

    //console.log( listed_data.length );






} );





