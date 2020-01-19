const video = document.getElementById('videoElement')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo).then(start)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


async function start() {
  
const labeledFaceDescriptors = await loadLabeledImages()
console.log("wowow")
const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    //document.body.append(detections.length)
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections, { label: results.toString() })
    console.log(results.toString());
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 10)
})
}

function loadLabeledImages() {
  const labels = ['tahami','taha','hammad'];
  
  // const labels = ['saim'];
  // const proxy = `https://cors-anywhere.herokuapp.com/`;
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      
       for (let i = 1; i <= 1; i++) {
        //https://raw.githubusercontent.com/tahamitofique/Face-Recognition/master/labled%20images/tahami/1.jpg
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/tahamitofique/Face-Recognition/master/labled%20images/${label}/${i}.jpg`, { mode: 'no-cors' });
        //const img = await faceapi.fetchImage(`https://firebasestorage.googleapis.com/v0/b/electronic-voting-d682c.appspot.com/o/${label}%2F${i}.jpg?alt=media&token=18819b84-1299-4e13-aeb5-9dc17a37cced`);
       
        
        //console.log(img.src)
        
        //console.log('img')
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
       }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
