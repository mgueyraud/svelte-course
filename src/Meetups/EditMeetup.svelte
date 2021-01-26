<script>
    import meetups from "./meetups-store";
    import { createEventDispatcher } from "svelte";
    import { isEmpty, isValidEmail } from "../helpers/validation";

    import Button from "../UI/Button.svelte";
    import TextInput from "../UI/TextInput.svelte";
    import Modal from "../UI/Modal.svelte";

    export let id = null;

    let title            = '';
    let subtitle         = '';
    let address          = '';
    let email            = '';
    let description      = '';
    let imageUrl         = '';

    if(id){
        const unsubscribe = meetups.subscribe( items => {
            const selectedMeetup = items.find(el => el.id ===  id);
            title       = selectedMeetup.title;
            subtitle    = selectedMeetup.subtitle;
            address     = selectedMeetup.address;
            email       = selectedMeetup.contactEmail;
            description = selectedMeetup.description;
            imageUrl    = selectedMeetup.imageUrl;
        });
        unsubscribe();
    }

    const dispatch = createEventDispatcher();

    $: titleValid       = !isEmpty(title);
    $: subtitleValid    = !isEmpty(subtitle);
    $: addressValid     = !isEmpty(address);
    $: emailValid       = !isEmpty(email) && isValidEmail(email);
    $: descriptionValid = !isEmpty(description);
    $: imageUrlValid    = !isEmpty(imageUrl);
    
    $: formIsValid      = titleValid && 
                            subtitleValid && 
                            addressValid && 
                            emailValid && 
                            descriptionValid && 
                            imageUrlValid;

    function submitForm(){

        const meetupData = {
            title: title,
            subtitle: subtitle,
            description: description,
            imageUrl: imageUrl,
            address: address,
            contactEmail: email
        };

        if(id){
            fetch(`https://svelte-course-45e6f-default-rtdb.firebaseio.com/meetups/${id}.json`, {
                method: 'PATCH',
                body: JSON.stringify(meetupData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if(!res.ok){
                    throw new Error("Error hijo de tu puta madre");
                }
                meetups.updateMeetup(id, meetupData);
            })
            .catch(err => {
                console.log(err);
            })
        }else{
            fetch("https://svelte-course-45e6f-default-rtdb.firebaseio.com/meetups.json", {
                method: 'POST',
                body: JSON.stringify({...meetupData, isFavorite: false}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if(!res.ok){
                    throw new Error("Error hijo de tu puta madre");
                }
                return res.json();
            })
            .then(data => {
                meetups.addMeetup({...meetupData, id: data.name, isFavorite: false});
            })
            .catch(err => {
                console.log(err);
            });
        }

        dispatch('save');
    }

    function cancel(){
        dispatch('cancel');
    }

    function handleDelete(){
        fetch(`https://svelte-course-45e6f-default-rtdb.firebaseio.com/meetups/${id}.json`, {
            method: 'DELETE'
        })
        .then(res => {
            if(!res.ok){
                throw new Error("Error hijo de tu puta madre");
            }
            meetups.removeMeetup(id);
        })
        .catch(err => {
            console.log(err);
        });
        dispatch('save');
    }

</script>

<style>
    form{
        width: 100%;
    }
</style>


<Modal title="Edit Meetup" on:cancel>
    <form on:submit|preventDefault="{submitForm}">
            
        <TextInput 
            id="title"
            label="Title"
            value={title}
            valid={titleValid}
            validityMessage="Please enter a valid title"
            on:input={(event) => title = event.target.value}
        />
        <TextInput 
            id="subtitle"
            label="Subtitle"
            value={subtitle}
            valid={subtitleValid}
            validityMessage="Please enter a valid subtitle"
            on:input={(event) => subtitle = event.target.value}
        />
        <TextInput 
            id="address"
            label="Address"
            value={address}
            valid={addressValid}
            validityMessage="Please enter a valid address"
            on:input={(event) => address = event.target.value}
        />
        <TextInput 
            id="imageUrl"
            label="Image Url"
            value={imageUrl}
            valid={imageUrlValid}
            validityMessage="Please enter a valid image url"
            on:input={(event) => imageUrl = event.target.value}
        />
        <TextInput 
            id="email"
            label="Email"
            type="email"
            value={email}
            valid={emailValid}
            validityMessage="Please enter a valid email"
            on:input={(event) => email = event.target.value}
        />
        <TextInput 
            id="description"
            controlType="textarea"
            rows="3"
            label="Description"
            value={description}
            valid={descriptionValid}
            validityMessage="Please enter a valid description"
            on:input={(event) => description = event.target.value}
        />
    </form>
    <div slot="footer">
        <Button type="button" mode="outline" on:click={cancel}>Cancel</Button>
        <Button type="button" on:click={submitForm} disabled={!formIsValid}>Save</Button>
        {#if id}
            <Button type="button" on:click={handleDelete}>Delete</Button>
        {/if}
    </div>
</Modal>