(function(){
  function replay(events){
    const start = performance.now();
    for(const ev of events){
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("syn-event", { detail: ev }));
      }, ev._time * 1000);
    }
    const duration = events[events.length-1]._time * 1000 + 500;
    setTimeout(() => replay(events), duration);
  }

  fetch("events.json")
    .then(r => r.json())
    .then(events => replay(events))
    .catch(console.error);
})();
