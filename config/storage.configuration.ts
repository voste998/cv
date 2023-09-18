export const StorageConfiguration = {
    photo: {
        destination: "../storage/photos",
        urlPrefix:"/assets/photos",
        photoNameGenerator: (originalfilename: string) => {
            const parts: string[] = [];

            const date: Date = new Date();
            const partOne=date.toISOString().slice(0, 10).replace(/\-/g, "");
            parts.push(partOne);

            const randNumbers: Array<number> = new Array(10);
            randNumbers.fill(0);
            randNumbers.forEach((value, index) => {
                let randNumber: number = Number((Math.random() * 8 + 1).toFixed(0));
                randNumbers[index] = randNumber;
            });

            parts.push(randNumbers.join(""));
            parts.push(originalfilename.replace(/\s+/g, '-'));

            return parts.join("-");
        },
        editedPhotoSize:{
            width:400,
            height:250
        },
        
    }

};
