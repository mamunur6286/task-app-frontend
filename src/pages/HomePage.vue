<template>
  <div>
    <NavbarComponent />
    <div class="container-xl mt-4">
      <div>
        <b-card
          header="Comment Importer"
          header-tag="header"
        >
              <div class="row">
                <div class="col-md-6">
                  <b-input-group class="mt-3">
                    <b-form-file @change="getFile" placeholder="Choose .json file" ref="file-input"></b-form-file>
                    <b-button @click="submitForm()" variant="info" class="ml-3">
                      <b-icon icon="upload"></b-icon> Upload
                    </b-button>
                  </b-input-group>
                  <b-alert v-if="!valid" show variant="danger" class="mt-2">File Is not Valid. <b v-if="errors.id">Invalid ID is  ({{ errors.id }}) </b></b-alert>
                </div>
              </div>
              <hr>
              <div class="table-title mt-4">
                  <div class="row">
                      <div class="col-md-8">
                        <h2 class="text-dark">Comments <b>List</b></h2>
                      </div>
                      <div class="col-md-4">
                          <div class="search-box">
                              <b-icon class="material-icons i" icon="search"></b-icon>
                              <input @keyup="getComment()" v-model="search.body" type="text" class="form-control" placeholder="Search...">
                          </div>
                      </div>
                  </div>
              </div>
          <div class="">
            <b-overlay :show="loading">
              <div class="table-responsive">
                <table class="table table-sm table-striped table-hover table-bordered">
                    <thead class="text-center">
                        <tr>
                            <th width="10%">SL No</th>
                            <th>Username</th>
                            <th>Post</th>
                            <th>Comment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody v-if="comments.length">
                        <tr v-for="(item, index) in comments" :key="index">
                            <td class="text-center">{{index+1 }}</td>
                            <td>{{ item.user.username }}</td>
                            <td class="text-center">{{ item.postId }}</td>
                            <td>{{ item.body }}</td>
                            <td>
                                <a href="#" class="edit" title="Edit" data-toggle="tooltip"><b-icon icon="trash">&#xE254;</b-icon></a>
                                <a href="#" class="delete" title="Delete" data-toggle="tooltip"><b-icon icon="pencil-square">&#xE254;</b-icon></a>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                      <tr>
                        <td colspan="5"><h4 class="text-center p-4">Data Not Found!</h4></td>
                      </tr>
                    </tbody>
                </table>
                <div class="clearfix mt-3">
                    <div class="hint-text">Showing <b>20</b> out of <b>30</b> entries.</div>
                    <ul class="pagination">
                        <li class="page-item disabled"><a href="#"><i class="fa fa-angle-double-left"></i></a></li>
                        <li class="page-item"><a href="#" class="page-link">1</a></li>
                        <li class="page-item"><a href="#" class="page-link">2</a></li>
                        <li class="page-item active"><a href="#" class="page-link">3</a></li>
                        <li class="page-item"><a href="#" class="page-link">4</a></li>
                        <li class="page-item"><a href="#" class="page-link">5</a></li>
                        <li class="page-item"><a href="#" class="page-link"><i class="fa fa-angle-double-right"></i></a></li>
                    </ul>
                </div>
              </div>
            </b-overlay>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import RestApi, { baseUrl } from '../config/api_config'
import NavbarComponent from '../components/navbar-component.vue'
export default {
  components: {
    NavbarComponent
  },
  data () {
    return {
      file: [],
      datas: [],
      valid: true,
      errors: {},
      formData: {
        users: [],
        posts: [],
        comments: []
      },
      comments: [],
      search: {
        body: ''
      }
    }
  },
  created () {
    this.getComment()
  },
  methods: {
    getFile (e) {
      if (e.target.files[0] === undefined) {
        this.datas = []
        this.errors = {}
        this.valid = true
      }
      const fileReader = new FileReader()
      fileReader.readAsText(e.target.files[0], "UTF-8")
      fileReader.onload = e => {
        this.datas = JSON.parse(e.target.result)
      }
    },
    checkFormat () {
      if (!this.datas.comments) {
        this.valid = false
        return false
      }
      this.datas.comments.map(item => {
        if (item.id === undefined || item.body === undefined || item.postId === undefined || item.user === undefined || item.user.id === undefined || item.user.username === undefined ) {
          this.valid = false
          this.errors = item
        }
      })
    },
    async submitForm () {
      try {
        this.checkFormat()
        this.formatData ()
        const result = await RestApi.postData(baseUrl,'api/v1/comments/store', this.formData)
        if (result.success) {
            this.getComment()
            this.$swal(
              'Success!',
              'Json file import successfully!',
              'success'
            );
        }
      } catch (error) {
        if (error) {
          this.$swal(
            'Error!',
            'Json file import failed!',
            'error'
          );
          console.log(error)
        }
        this.loading = false
      }
    },
    formatData () {
      let tmpUser = []
      let tmpPost = []
      let tmpComment = []
      this.datas.comments.forEach(comment => {
        // find user push unique user
        const user = tmpUser.find(item => item.id === comment.user.id)
        if (typeof user === 'undefined') {
          tmpUser.push(comment.user)
        }
        // find post push unique user
        const post = tmpPost.find(item => item.id === comment.postId)
        if (typeof post === 'undefined') {
          tmpPost.push({
            id: comment.postId,
            user_id: comment.user.id
          })
        }
        // find comments push unique user
        const commentOne = tmpComment.find(item => item.id === comment.id)
        if (typeof commentOne === 'undefined') {
          tmpComment.push({
            id: comment.id,
            body: comment.body,
            postId: comment.postId,
            user_id: comment.user.id
          })
        }
      })
      this.formData.users = tmpUser
      this.formData.posts = tmpPost
      this.formData.comments = tmpComment
    },
    async getComment () {
      try {
        this.loading = true
        const result = await RestApi.getData(baseUrl,'api/v1/comments/list', { body: this.search.body })
        this.loading = false
        this.comments = result.data
      } catch (error) {
        if (error) {
           this.$swal(
            'Error!',
            'Data show error!',
            'error'
          );
          console.log(error)
        }
        this.loading = false
      }
    }
  }
}
</script>
