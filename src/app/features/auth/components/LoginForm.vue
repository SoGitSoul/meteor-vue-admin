<template>
  <VCard>
    <VCardTitle primary-title>
      <div>
        <h2 class="headline mb-0">
          Cloudspider Admin
        </h2>
        <p>Welcome! Please login first</p>
      </div>
    </VCardTitle>

    <VCardText>
      <VForm
          v-model="isValid"
          @submit.prevent="submit"
      >
        <VTextField
            v-model="email"
            v-validate="'required|email'"
            autofocus
            color="dark"
            type="email"
            label="E-mail address"
            data-vv-name="email"
            :error-messages="errors.collect('email')"
        />
        <VTextField
            v-model="password"
            v-validate="'required'"
            type="password"
            color="dark"
            label="Password"
            data-vv-name="password"
            :error-messages="errors.collect('password')"
        />

        <VAlert
            :value="!!error"
            color="error"
            icon="warning"
            outline
        >
          {{ error }}
        </VAlert>


        <VBtn
            type="submit"
            :color="status.color"
            :dark="status.dark"
            block
        >
          {{ status.submitTitle }}
        </VBtn>

        <p class="text-lg-right mt-4">
          <VBtn
              flat
              small
              :to="forgotPasswordLink"
          >
            Lost your password? Reset it here!
          </VBtn>
        </p>
        <p class="text-lg-right mt-4">
          <VBtn
              flat
              small
              :to="registrationLink"
          >
            Register yourself now!
          </VBtn>
        </p>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script>
  export default {
    props: {
      registrationLink: { type: String, default: '/registration' },
      forgotPasswordLink: { type: String, default: '/forgot-password' },
    },
    data() {
      return {
        isValid: false,
        email: '',
        password: '',
        error: '',
        status: { submitTitle: 'Login', color: 'secondary', dark: true },
      };
    },

    methods: {
      async submit() {
        await this.$validator.validateAll();

        const { email, password } = this;

        if (!this.isValid) {
          return;
        }

        this.status = { submitTitle: 'Logging you in...', color: 'default' };

        await this.$store.dispatch('login', { email, password })
          .then(() => {
            this.status = { submitTitle: 'Login', color: 'secondary', dark: true };
            this.error = '';
          })
          .catch((error) => {
            this.status = { submitTitle: 'Oops! Something went wrong...', color: 'error', dark: true };
            this.error = error;
          });

      },
    },
  };
</script>
