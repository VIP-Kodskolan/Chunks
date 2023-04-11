
    document.querySelector(".filterDoneButton").addEventListener("click", function(){
      const allDone =  document.querySelectorAll(".icon");
     console.log(allDone)
      allDone.forEach(element => {
     

  
   
        const foundItem = element.closest(".status_complete");
        if(foundItem != null){
     
            if(  foundItem.style.display == "none"){
                foundItem.style.display = 'flex';
            }else{
                foundItem.style.display = 'none';
            }
        
        }


/*
        if(element.style.backgroundColor == "color_accent_completed_unit")
        {
           
         
        }
  */
      });
    })


    document.querySelector(".filterQuestionButton").addEventListener("click", function(){
        const allDone =  document.querySelectorAll(".question_mark");
       console.log(allDone)
        allDone.forEach(element => {
       
  
    
     
          const foundItem = element.closest(".status_question");
          if(foundItem != null){
       
              if(  foundItem.style.display == "none"){
                  foundItem.style.display = 'flex';
              }else{
                  foundItem.style.display = 'none';
              }
          
          }
  
  
  /*
          if(element.style.backgroundColor == "color_accent_completed_unit")
          {
             
           
          }
    */
        });
      })

      document.querySelector(".filterUnfinishedButton").addEventListener("click", function(){
        const allDone =  document.querySelectorAll(".icon");

        allDone.forEach(element => {
       
  
    
     
            const foundItem = element.closest(".unit_item");
        
          if(foundItem != null ){
            if(foundItem.getAttribute("class") != "unit_item exercise status_question" && foundItem.getAttribute("class") != "unit_item exercise status_complete" && foundItem.getAttribute("class") != "unit_item video status_complete"){
              if(  foundItem.style.display == "none"){
                foundItem.style.display = 'flex';
            }else{
                foundItem.style.display = 'none';
            }
    
        }


          }
  
  
  /*
          if(element.style.backgroundColor == "color_accent_completed_unit")
          {
             
           
          }
    */
        });
      })



     

    export default{}
