Vue.component('emr-component', {
    template: `
      <div class = "emr-component">
        <table class="table">
          <thead class="thead-light">
            <tr>
              <th colspan="2">Admission Information</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in emr.AdmissionInfo">
              <td>|| key ||:</td>
              <td v-if="value != ''">|| value ||</td>
              <td v-else>-</td>
            </tr>
          </tbody>
        </table>
        <table class="table">
          <thead class="thead-light">
            <tr>
              <th colspan="2">Prescriptions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(prescription, idx) in emr.Prescriptions">
              <td>
                <table>
                  <thead class="thead-light">
                    <tr>
                      <th colspan="2">Prescription || idx + 1 ||</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(value, key) in prescription">
                      <td>|| key ||:</td>
                      <td v-if="value != ''">|| value ||</td>
                      <td v-else>-</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <table class="table">
          <thead class="thead-light">
            <tr>
              <th colspan="2">Patient Information</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in emr.PatientInfo">
              <td>|| key ||:</td>
              <td v-if="value != ''">|| value ||</td>
              <td v-else>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    props: ['emr'],
    delimiters: ["||", "||"],
});