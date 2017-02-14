$( document ).ready(function() {
 $('#myCheckbox').bind('touchstart click', function(){
        if($(this).is(':checked'))
            $('.hidefrom').show();
        else
            $('.hidefrom').hide();
    });
    
});