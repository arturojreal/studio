const { MarkerModule, Package } = ARjsStudioBackend;

function checkTpl(tpl) {
    tpl.showDistance = !!tpl.showDistance;
    tpl.showName = !!tpl.showName;
    tpl.heightFromGround = parseFloat(tpl.heightFromGround) || 0;
    if (tpl.places && tpl.places.length > 0) {
        for (let places = tpl.places, i = places.length - 1; i >= 0; i--) {
            let one = places[i];
            // one.id ??
            one.name = (one.name || '').trim();

            one.latitude = parseFloat(one.latitude);
            if (isNaN(one.latitude) || one.latitude < -90 || one.latitude > 90) return `The ${i + 1} latitude shoulde be in range of -90 ~ 90`;

            one.longitude = parseFloat(one.longitude);
            if (isNaN(one.longitude) || one.longitude < -180 || one.longitude > 180) return `The ${i + 1} longitude shoulde be in range of -90 ~ 90`;
        }
    }
    if (!tpl.places || tpl.places.length < 1) return 'No valid places';
};

function getTplFile(self) {
    const tplError = document.getElementById("tpl-error");
    tplError.innerHTML = '';

    const file = self.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = function () {
        try {
            eval('var tpl=' + reader.result);
            let error = checkTpl(tpl);
            if (error) {
                tplError.innerHTML = '* Your uploaded JSON file is error: <br/>' + error;
            } else {
                // TODO use this tpl
                console.log(tpl);
            }

        } catch (error) {
            tplError.innerHTML = '* Your uploaded JSON file is error: <br/>' + error.toString();
        }
    };


    self.value = ''; // Reset required for re-upload
};

function uploadLocations() {
    var uploadTpl = document.getElementById('uploadTpl');
    uploadTpl.click();
};

function downloadJsonTpl() {
    // var tpl = 'aaaa';
    var base64 = btoa(multiLocationsTemplate);
    var link = document.createElement('a');
    link.href = `data:application/json;base64,${base64}`;
    link.download = "template.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const checkUserUploadStatus = () => {
    if (window.markerImage && window.assetFile) {
        enablePageFooter();
    }
}

// All the required components are uploaded by the user => footer will be enable
const enablePageFooter = () => {
    githubButton.classList.remove('publish-disabled');
    zipButton.classList.remove('publish-disabled');
    zipButton.removeAttribute('disabled');
}

const zip = () => {
    // TODO: replace alerts with HTML error messages.
    if (!window.markerImage) return alert('please select a marker image');
    if (!window.assetType) return alert('please select the corret content type');
    if (!window.assetFile || !window.assetName) return alert('please upload a content');

    MarkerModule.getMarkerPattern(window.markerImage)
        .then((markerPattern) => (new Package({
            arType: 'pattern',
            assetType: window.assetType, // image/audio/video/3d
            assetFile: window.assetFile,
            assetName: window.assetName,
            assetParam: window.assetParam && (window.assetParam.isValid ? window.assetParam : null),
            markerPatt: markerPattern
        })))
        .then((package) => package.serve({ packageType: "zip" }))
        .then((base64) => {
            // window.location = `data:application/zip;base64,${base64}`;
            // sometimes it doesn't work by use window.location directly, so change to this way
            var link = document.createElement('a');
            link.href = `data:application/zip;base64,${base64}`;
            link.download = "ar.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);


        });
};

const element = document.querySelector("page-footer");
element.addEventListener("onClick", zip);
